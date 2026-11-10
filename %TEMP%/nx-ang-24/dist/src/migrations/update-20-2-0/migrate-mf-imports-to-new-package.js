"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = migrateMfImportsToNewPackage;
const devkit_1 = require("@nx/devkit");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const MF_IMPORT_TO_UPDATE = 'ModuleFederationConfig';
const MF_CONFIG_IMPORT_SELECTOR = `ImportDeclaration:has(StringLiteral[value=@nx/webpack]):has(Identifier[name=ModuleFederationConfig])`;
const IMPORT_TOKENS_SELECTOR = `ImportClause ImportSpecifier`;
const MF_CONFIG_IMPORT_SPECIFIER_SELECTOR = `ImportClause ImportSpecifier > Identifier[name=ModuleFederationConfig]`;
const WEBPACK_IMPORT_SELECTOR = `ImportDeclaration > StringLiteral[value=@nx/webpack]`;
async function migrateMfImportsToNewPackage(tree) {
    const rootsToCheck = new Set();
    const graph = await (0, devkit_1.createProjectGraphAsync)();
    for (const [project, dependencies] of Object.entries(graph.dependencies)) {
        if (!graph.nodes[project]) {
            continue;
        }
        const usesNxWebpack = dependencies.some((dep) => dep.target === 'npm:@nx/webpack');
        if (usesNxWebpack) {
            const root = graph.nodes[project].data.root;
            rootsToCheck.add(root);
        }
    }
    for (const root of rootsToCheck) {
        (0, devkit_1.visitNotIgnoredFiles)(tree, root, (filePath) => {
            if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
                return;
            }
            let contents = tree.read(filePath, 'utf-8');
            if (!contents.includes(MF_IMPORT_TO_UPDATE)) {
                return;
            }
            const sourceFile = (0, tsquery_1.ast)(contents);
            const importNodes = (0, tsquery_1.query)(sourceFile, MF_CONFIG_IMPORT_SELECTOR);
            if (importNodes.length === 0) {
                return;
            }
            const importNode = importNodes[0];
            const importSpecifiers = (0, tsquery_1.query)(importNode, IMPORT_TOKENS_SELECTOR);
            if (importSpecifiers.length > 1) {
                const mfConfigImportSpecifierNode = (0, tsquery_1.query)(importNode, MF_CONFIG_IMPORT_SPECIFIER_SELECTOR)[0];
                const end = contents.charAt(mfConfigImportSpecifierNode.getEnd()) === ','
                    ? mfConfigImportSpecifierNode.getEnd() + 1
                    : mfConfigImportSpecifierNode.getEnd();
                contents = `import { ${MF_IMPORT_TO_UPDATE} } from '@nx/module-federation';
      ${contents.slice(0, mfConfigImportSpecifierNode.getStart())}${contents.slice(end)}`;
            }
            else {
                const nxWebpackImportStringNodes = (0, tsquery_1.query)(sourceFile, WEBPACK_IMPORT_SELECTOR);
                if (nxWebpackImportStringNodes.length === 0) {
                    return;
                }
                const nxWebpackImportStringNode = nxWebpackImportStringNodes[0];
                contents = `${contents.slice(0, nxWebpackImportStringNode.getStart())}'@nx/module-federation'${contents.slice(nxWebpackImportStringNode.getEnd())}`;
            }
            tree.write(filePath, contents);
        });
    }
    await (0, devkit_1.formatFiles)(tree);
}
