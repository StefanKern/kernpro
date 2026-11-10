"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rewriteInternalSubpathImports;
exports.rewriteSubpathImports = rewriteSubpathImports;
const devkit_1 = require("@nx/devkit");
const TS_EXTENSIONS = ['.ts', '.tsx', '.cts', '.mts'];
const DROPPED_PREFIXES = [
    '@nx/angular/src/utils',
    '@nx/angular/src/generators/utils',
    '@nx/angular/src/generators/move/move-impl',
];
function matchesDropped(text) {
    return DROPPED_PREFIXES.some((p) => text === p || text.startsWith(p + '/'));
}
const TO_PUBLIC = '@nx/angular';
const TO_INTERNAL = '@nx/angular/internal';
// Symbols exported from `@nx/angular`'s public entry (packages/angular/index.ts).
// A named import/export of one of these from `@nx/angular/src/*` is routed to
// the public `@nx/angular` entry; everything else goes to `@nx/angular/internal`.
const PUBLIC_SYMBOLS = new Set([]);
// Methods on `jest` and `vi` that take a module specifier as their first arg.
const MOCK_HELPER_METHODS = new Set([
    'mock',
    'unmock',
    'doMock',
    'dontMock',
    'requireActual',
    'requireMock',
    'importActual',
    'importMock',
]);
let ts;
async function rewriteInternalSubpathImports(tree) {
    let touchedCount = 0;
    (0, devkit_1.visitNotIgnoredFiles)(tree, '.', (filePath) => {
        if (!TS_EXTENSIONS.some((ext) => filePath.endsWith(ext))) {
            return;
        }
        const original = tree.read(filePath, 'utf-8');
        if (!original || !DROPPED_PREFIXES.some((p) => original.includes(p))) {
            return;
        }
        const updated = rewriteSubpathImports(original);
        if (updated !== original) {
            tree.write(filePath, updated);
            touchedCount += 1;
        }
    });
    if (touchedCount > 0) {
        devkit_1.logger.info(`Rewrote @nx/angular/src/* imports in ${touchedCount} file(s) ` +
            `(public symbols to @nx/angular, internals to @nx/angular/internal).`);
    }
    await (0, devkit_1.formatFiles)(tree);
}
function rewriteSubpathImports(source) {
    ts ??= (0, devkit_1.ensurePackage)('typescript', '*');
    const sourceFile = ts.createSourceFile('tmp.ts', source, ts.ScriptTarget.Latest, 
    /* setParentNodes */ true, ts.ScriptKind.TSX);
    const changes = [];
    for (const stmt of sourceFile.statements) {
        if (ts.isImportDeclaration(stmt)) {
            collectImportRewrite(sourceFile, stmt, changes);
        }
        else if (ts.isExportDeclaration(stmt)) {
            collectExportRewrite(sourceFile, stmt, changes);
        }
    }
    collectCallExpressionRewrites(sourceFile, changes);
    return changes.length > 0 ? (0, devkit_1.applyChangesToString)(source, changes) : source;
}
function isSubpathSpecifier(node) {
    return ts.isStringLiteral(node) && matchesDropped(node.text);
}
function collectImportRewrite(sourceFile, stmt, changes) {
    if (!isSubpathSpecifier(stmt.moduleSpecifier)) {
        return;
    }
    const clause = stmt.importClause;
    // Pure named imports (`import { a, b } from '...'`) can be split by symbol.
    // A default or namespace import grabs the whole module, so it can't be
    // split — route it wholesale to the internal entry.
    if (clause &&
        !clause.name &&
        clause.namedBindings &&
        ts.isNamedImports(clause.namedBindings)) {
        rewriteNamedDeclaration(sourceFile, stmt, stmt.moduleSpecifier, clause.isTypeOnly, clause.namedBindings.elements, 'import', changes);
        return;
    }
    replaceSpecifier(sourceFile, stmt.moduleSpecifier, TO_INTERNAL, changes);
}
function collectExportRewrite(sourceFile, stmt, changes) {
    if (!stmt.moduleSpecifier || !isSubpathSpecifier(stmt.moduleSpecifier)) {
        return;
    }
    // `export { a, b } from '...'` can be split; `export * from '...'` cannot.
    if (stmt.exportClause && ts.isNamedExports(stmt.exportClause)) {
        rewriteNamedDeclaration(sourceFile, stmt, stmt.moduleSpecifier, stmt.isTypeOnly, stmt.exportClause.elements, 'export', changes);
        return;
    }
    replaceSpecifier(sourceFile, stmt.moduleSpecifier, TO_INTERNAL, changes);
}
/**
 * Partition the named bindings of an import/export declaration into the ones
 * that resolve to `@nx/angular`'s public entry and the ones that don't. If both
 * groups are non-empty, the single declaration is split into two.
 */
function rewriteNamedDeclaration(sourceFile, decl, specifier, isTypeOnly, elements, keyword, changes) {
    const publicEls = [];
    const internalEls = [];
    for (const el of elements) {
        // `propertyName` is the original name in `orig as alias`; fall back to
        // `name` for the plain `orig` form.
        const importedName = (el.propertyName ?? el.name).text;
        (PUBLIC_SYMBOLS.has(importedName) ? publicEls : internalEls).push(el);
    }
    if (publicEls.length === 0) {
        replaceSpecifier(sourceFile, specifier, TO_INTERNAL, changes);
        return;
    }
    if (internalEls.length === 0) {
        replaceSpecifier(sourceFile, specifier, TO_PUBLIC, changes);
        return;
    }
    // Mixed — replace the whole declaration with one statement per target.
    const quote = sourceFile.text.charAt(specifier.getStart(sourceFile));
    const start = decl.getStart(sourceFile);
    const end = decl.getEnd();
    const semicolon = sourceFile.text.charAt(end - 1) === ';' ? ';' : '';
    const prefix = isTypeOnly ? `${keyword} type` : keyword;
    const render = (els, target) => `${prefix} { ${els
        .map((el) => el.getText(sourceFile))
        .join(', ')} } from ${quote}${target}${quote}${semicolon}`;
    changes.push({ type: devkit_1.ChangeType.Delete, start, length: end - start }, {
        type: devkit_1.ChangeType.Insert,
        index: start,
        text: `${render(publicEls, TO_PUBLIC)}\n${render(internalEls, TO_INTERNAL)}`,
    });
}
function collectCallExpressionRewrites(sourceFile, changes) {
    const visit = (node) => {
        if (ts.isCallExpression(node) &&
            shouldRewriteCallExpression(node) &&
            node.arguments.length >= 1 &&
            isSubpathSpecifier(node.arguments[0])) {
            // `require(...)`, dynamic `import(...)` and `jest.mock(...)` reference
            // the module as a whole and can't be symbol-split, so they go to the
            // internal entry.
            replaceSpecifier(sourceFile, node.arguments[0], TO_INTERNAL, changes);
        }
        else if (ts.isImportTypeNode(node)) {
            // `typeof import('...')` parses as an `ImportTypeNode`, not a
            // CallExpression — its argument is `LiteralTypeNode<StringLiteral>`.
            // The whole module is referenced, so it can't be symbol-split.
            const literal = getImportTypeStringLiteral(node);
            if (literal && matchesDropped(literal.text)) {
                replaceSpecifier(sourceFile, literal, TO_INTERNAL, changes);
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
}
function getImportTypeStringLiteral(node) {
    const arg = node.argument;
    if (arg && ts.isLiteralTypeNode(arg) && ts.isStringLiteral(arg.literal)) {
        return arg.literal;
    }
    return undefined;
}
function shouldRewriteCallExpression(call) {
    const callee = call.expression;
    // `require('...')`
    if (ts.isIdentifier(callee) && callee.text === 'require')
        return true;
    // dynamic `import('...')` (runtime form parses as a CallExpression whose
    // callee is the `import` keyword). The `typeof import('...')` type-position
    // form is an `ImportTypeNode` (handled in `collectCallExpressionRewrites`).
    if (callee.kind === ts.SyntaxKind.ImportKeyword)
        return true;
    // `jest.mock(...)` / `vi.mock(...)` and friends.
    if (ts.isPropertyAccessExpression(callee)) {
        const obj = callee.expression;
        if (ts.isIdentifier(obj) &&
            (obj.text === 'jest' || obj.text === 'vi') &&
            MOCK_HELPER_METHODS.has(callee.name.text)) {
            return true;
        }
    }
    return false;
}
function replaceSpecifier(sourceFile, literal, target, changes) {
    const start = literal.getStart(sourceFile);
    const end = literal.getEnd();
    const quote = sourceFile.text.charAt(start);
    changes.push({ type: devkit_1.ChangeType.Delete, start, length: end - start }, {
        type: devkit_1.ChangeType.Insert,
        index: start,
        text: `${quote}${target}${quote}`,
    });
}
