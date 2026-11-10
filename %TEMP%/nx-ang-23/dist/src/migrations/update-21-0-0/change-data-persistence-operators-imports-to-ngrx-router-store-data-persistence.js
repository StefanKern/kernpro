"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const internal_2 = require("@nx/devkit/internal");
const version_utils_1 = require("../../generators/utils/version-utils");
const file_change_recorder_1 = require("../../utils/file-change-recorder");
const projects_1 = require("../utils/projects");
let tsqueryAst;
let tsqueryQuery;
const angularPluginTargetNames = ['npm:@nx/angular', 'npm:@nrwl/angular'];
const dataPersistenceOperators = [
    'fetch',
    'navigation',
    'optimisticUpdate',
    'pessimisticUpdate',
];
const newImportPath = '@ngrx/router-store/data-persistence';
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)(angularPluginTargetNames);
    if (!projects.length) {
        return;
    }
    (0, internal_1.ensureTypescript)();
    const tsqueryModule = require('@phenomnomnominal/tsquery');
    tsqueryAst = tsqueryModule.ast;
    tsqueryQuery = tsqueryModule.query;
    const cachedFileMap = (0, internal_2.readFileMapCache)().fileMap.projectFileMap;
    const filesWithNxAngularImports = [];
    for (const graphNode of projects) {
        const files = filterFilesWithNxAngularDep(cachedFileMap[graphNode.name] || []);
        filesWithNxAngularImports.push(...files);
    }
    let isAnyFileUsingDataPersistence = false;
    for (const { file } of filesWithNxAngularImports) {
        const updated = replaceDataPersistenceInFile(tree, file);
        isAnyFileUsingDataPersistence ||= updated;
    }
    if (isAnyFileUsingDataPersistence) {
        addNgrxRouterStoreIfNotInstalled(tree);
        await (0, devkit_1.formatFiles)(tree);
    }
}
function replaceDataPersistenceInFile(tree, file) {
    const fileContents = tree.read(file, 'utf-8');
    const fileAst = tsqueryAst(fileContents);
    // "\\u002F" is the unicode code for "/", there's an issue with the query parser
    // that prevents using "/" directly in regex queries
    // https://github.com/estools/esquery/issues/68#issuecomment-415597670
    const NX_ANGULAR_IMPORT_SELECTOR = 'ImportDeclaration:has(StringLiteral[value=/@(nx|nrwl)\\u002Fangular$/])';
    const nxAngularImports = tsqueryQuery(fileAst, NX_ANGULAR_IMPORT_SELECTOR);
    if (!nxAngularImports.length) {
        return false;
    }
    const recorder = new file_change_recorder_1.FileChangeRecorder(tree, file);
    const IMPORT_SPECIFIERS_SELECTOR = 'ImportClause NamedImports ImportSpecifier';
    for (const importDeclaration of nxAngularImports) {
        const importSpecifiers = tsqueryQuery(importDeclaration, IMPORT_SPECIFIERS_SELECTOR);
        if (!importSpecifiers.length) {
            continue;
        }
        // no imported symbol is a data persistence operator, skip
        if (importSpecifiers.every((i) => !isOperatorImport(i))) {
            continue;
        }
        // all imported symbols are data persistence operators, change import path
        if (importSpecifiers.every((i) => isOperatorImport(i))) {
            const IMPORT_PATH_SELECTOR = `${NX_ANGULAR_IMPORT_SELECTOR} > StringLiteral`;
            const importPathNode = tsqueryQuery(importDeclaration, IMPORT_PATH_SELECTOR);
            recorder.replace(importPathNode[0], `'${newImportPath}'`);
            continue;
        }
        // mixed imports, split data persistence operators to a separate import
        const operatorImportSpecifiers = [];
        for (const importSpecifier of importSpecifiers) {
            if (isOperatorImport(importSpecifier)) {
                operatorImportSpecifiers.push(importSpecifier.getText());
                recorder.remove(importSpecifier.getStart(), importSpecifier.getEnd() +
                    (hasTrailingComma(recorder.originalContent, importSpecifier)
                        ? 1
                        : 0));
            }
        }
        recorder.insertLeft(importDeclaration.getStart(), `import { ${operatorImportSpecifiers.join(', ')} } from '${newImportPath}';`);
    }
    if (recorder.hasChanged()) {
        recorder.applyChanges();
        return true;
    }
    return false;
}
function hasTrailingComma(content, node) {
    return content[node.getEnd()] === ',';
}
function isOperatorImport(importSpecifier) {
    return dataPersistenceOperators.includes(getOriginalIdentifierTextFromImportSpecifier(importSpecifier));
}
function getOriginalIdentifierTextFromImportSpecifier(importSpecifier) {
    const children = importSpecifier.getChildren();
    if (!children.length) {
        return importSpecifier.getText();
    }
    return children[0].getText();
}
function addNgrxRouterStoreIfNotInstalled(tree) {
    const { dependencies, devDependencies } = (0, devkit_1.readJson)(tree, 'package.json');
    if (dependencies?.['@ngrx/router-store'] ||
        devDependencies?.['@ngrx/router-store']) {
        return;
    }
    (0, devkit_1.addDependenciesToPackageJson)(tree, { '@ngrx/router-store': (0, version_utils_1.versions)(tree).ngrxVersion }, {});
}
function filterFilesWithNxAngularDep(files) {
    const filteredFiles = [];
    for (const file of files) {
        if (file.deps?.some((dep) => angularPluginTargetNames.includes((0, internal_2.fileDataDepTarget)(dep)))) {
            filteredFiles.push(file);
        }
    }
    return filteredFiles;
}
