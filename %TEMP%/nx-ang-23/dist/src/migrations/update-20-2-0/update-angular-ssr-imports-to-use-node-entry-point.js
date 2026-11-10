"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const ts = tslib_1.__importStar(require("typescript"));
const file_change_recorder_1 = require("../../utils/file-change-recorder");
const projects_1 = require("../utils/projects");
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/ssr',
    ]);
    for (const graphNode of projects) {
        (0, devkit_1.visitNotIgnoredFiles)(tree, graphNode.data.root, (path) => {
            if (!path.endsWith('.ts') || path.endsWith('.d.ts')) {
                return;
            }
            let content = tree.read(path, 'utf-8');
            if (!content.includes('CommonEngine') ||
                content.includes('@angular/ssr/node')) {
                return;
            }
            let recorder;
            const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
            const allImportDeclarations = sourceFile.statements.filter(ts.isImportDeclaration);
            if (allImportDeclarations.length === 0) {
                return;
            }
            const ssrImports = allImportDeclarations.filter((n) => ts.isStringLiteral(n.moduleSpecifier) &&
                n.moduleSpecifier.text === '@angular/ssr');
            for (const ssrImport of ssrImports) {
                const ssrNamedBinding = getNamedImports(ssrImport);
                if (ssrNamedBinding) {
                    const isUsingOldEntryPoint = ssrNamedBinding.elements.some((e) => e.name.text.startsWith('CommonEngine'));
                    if (!isUsingOldEntryPoint) {
                        continue;
                    }
                    recorder ??= new file_change_recorder_1.FileChangeRecorder(tree, path);
                    recorder.insertRight(ssrImport.moduleSpecifier.getEnd() - 1, '/node');
                }
            }
            if (recorder) {
                recorder.applyChanges();
            }
        });
    }
    await (0, devkit_1.formatFiles)(tree);
}
function getNamedImports(importDeclaration) {
    const namedBindings = importDeclaration?.importClause?.namedBindings;
    if (namedBindings && ts.isNamedImports(namedBindings)) {
        return namedBindings;
    }
    return undefined;
}
