"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentsInfo = getComponentsInfo;
exports.getStandaloneComponentsInfo = getStandaloneComponentsInfo;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const path_1 = require("path");
const ast_utils_1 = require("../../../utils/nx-devkit/ast-utils");
const module_info_1 = require("./module-info");
let tsModule;
let tsqueryAst;
let tsqueryQuery;
function getComponentsInfo(tree, entryPoint, moduleFilePaths, projectName) {
    return moduleFilePaths
        .flatMap((moduleFilePath) => {
        const file = (0, ast_utils_1.getTsSourceFile)(tree, moduleFilePath);
        const moduleDeclarations = (0, module_info_1.getModuleDeclarations)(file, moduleFilePath, projectName);
        if (moduleDeclarations.length === 0) {
            return undefined;
        }
        if (!tsModule) {
            tsModule = (0, internal_1.ensureTypescript)();
        }
        const imports = file.statements.filter((statement) => statement.kind === tsModule.SyntaxKind.ImportDeclaration);
        const componentsInfo = moduleDeclarations.map((maybeComponentName) => tryGetComponentInfo(tree, entryPoint, file, imports, moduleFilePath, maybeComponentName));
        return componentsInfo;
    })
        .filter((f) => f !== undefined);
}
function getStandaloneComponentsInfo(tree, entryPoint) {
    const componentsInfo = [];
    (0, devkit_1.visitNotIgnoredFiles)(tree, entryPoint.path, (filePath) => {
        const normalizedFilePath = (0, devkit_1.normalizePath)(filePath);
        if (entryPoint.excludeDirs?.some((excludeDir) => normalizedFilePath.startsWith(excludeDir))) {
            return;
        }
        if ((0, path_1.extname)(normalizedFilePath) !== '.ts' ||
            normalizedFilePath.includes('.storybook')) {
            return;
        }
        const standaloneComponents = getStandaloneComponents(tree, normalizedFilePath);
        if (!standaloneComponents.length) {
            return;
        }
        standaloneComponents.forEach((componentName) => {
            componentsInfo.push({
                componentFileName: (0, path_1.basename)(normalizedFilePath, '.ts'),
                moduleFolderPath: entryPoint.path,
                name: componentName,
                path: (0, path_1.dirname)((0, path_1.relative)(entryPoint.path, normalizedFilePath)),
                entryPointName: entryPoint.name,
            });
        });
    });
    return componentsInfo;
}
function getStandaloneComponents(tree, filePath) {
    if (!tsqueryAst) {
        (0, internal_1.ensureTypescript)();
        const tsqueryModule = require('@phenomnomnominal/tsquery');
        tsqueryAst = tsqueryModule.ast;
        tsqueryQuery = tsqueryModule.query;
    }
    const fileContent = tree.read(filePath, 'utf-8');
    const sourceFile = tsqueryAst(fileContent);
    // standalone: true is the default, so all components except those with
    // standalone: false are considered standalone
    const standaloneComponentNodes = tsqueryQuery(sourceFile, 'ClassDeclaration:has(Decorator > CallExpression:has(Identifier[name=Component]) ObjectLiteralExpression:not(:has(PropertyAssignment:has(Identifier[name=standalone]) > FalseKeyword))) > Identifier');
    return standaloneComponentNodes.map((component) => component.getText());
}
function getComponentImportPath(componentName, imports) {
    if (!tsModule) {
        tsModule = (0, internal_1.ensureTypescript)();
    }
    const componentImportStatement = imports.find((statement) => {
        const namedImports = statement
            .getChildren()
            .find((node) => node.kind === tsModule.SyntaxKind.ImportClause)
            .getChildren()
            .find((node) => node.kind === tsModule.SyntaxKind.NamedImports);
        if (namedImports === undefined)
            return false;
        const importedIdentifiers = namedImports
            .getChildren()
            .find((node) => node.kind === tsModule.SyntaxKind.SyntaxList)
            .getChildren()
            .filter((node) => node.kind === tsModule.SyntaxKind.ImportSpecifier)
            .map((node) => node.getText());
        return importedIdentifiers.includes(componentName);
    });
    const importPath = componentImportStatement
        .getChildren()
        .find((node) => node.kind === tsModule.SyntaxKind.StringLiteral)
        .getText()
        .slice(1, -1);
    return importPath;
}
function tryGetComponentInfo(tree, entryPoint, sourceFile, imports, moduleFilePath, symbolName) {
    try {
        if (!tsqueryQuery) {
            (0, internal_1.ensureTypescript)();
            const tsqueryModule = require('@phenomnomnominal/tsquery');
            tsqueryAst = tsqueryModule.ast;
            tsqueryQuery = tsqueryModule.query;
        }
        const moduleFolderPath = (0, path_1.dirname)(moduleFilePath);
        // try to get the component from the same file (inline scam)
        const node = tsqueryQuery(sourceFile, `ClassDeclaration:has(Decorator > CallExpression > Identifier[name=Component]):has(Identifier[name=${symbolName}])`)[0];
        if (node) {
            return {
                componentFileName: (0, path_1.basename)(moduleFilePath, '.ts'),
                moduleFolderPath,
                name: symbolName,
                path: '.',
                entryPointName: entryPoint.name,
            };
        }
        // try to get the component from the imports
        const symbolFilePathRelativeToModule = getComponentImportPath(symbolName, imports);
        let symbolImportPath = getFullComponentFilePath(moduleFolderPath, symbolFilePathRelativeToModule);
        if (tree.exists(symbolImportPath) && !tree.isFile(symbolImportPath)) {
            return tryGetComponentInfoFromDir(tree, entryPoint, symbolImportPath, symbolName, moduleFolderPath);
        }
        const candidatePaths = [
            symbolImportPath,
            `${symbolImportPath}.ts`,
            `${symbolImportPath}.js`,
        ];
        for (const candidatePath of candidatePaths) {
            if (!tree.exists(candidatePath)) {
                continue;
            }
            const content = tree.read(candidatePath, 'utf-8');
            const classAndComponentRegex = new RegExp(`@Component[\\s\\S\n]*?\\bclass ${symbolName}\\b`, 'g');
            if (content.match(classAndComponentRegex)) {
                const path = (0, path_1.dirname)(symbolFilePathRelativeToModule);
                const componentFileName = (0, path_1.basename)(symbolFilePathRelativeToModule);
                return {
                    componentFileName,
                    moduleFolderPath,
                    name: symbolName,
                    path,
                    entryPointName: entryPoint.name,
                };
            }
        }
        return undefined;
    }
    catch (ex) {
        devkit_1.logger.warn(`Could not generate a story for ${symbolName}. Error: ${ex}`);
        return undefined;
    }
}
function tryGetComponentInfoFromDir(tree, entryPoint, dir, symbolName, moduleFolderPath) {
    let path = null;
    let componentFileName = null;
    const componentImportPathChildren = [];
    (0, devkit_1.visitNotIgnoredFiles)(tree, dir, (filePath) => {
        componentImportPathChildren.push((0, devkit_1.normalizePath)(filePath));
    });
    for (const candidateFile of componentImportPathChildren) {
        if (candidateFile.endsWith('.ts')) {
            const content = tree.read(candidateFile, 'utf-8');
            const classAndComponentRegex = new RegExp(`@Component[\\s\\S\n]*?\\bclass ${symbolName}\\b`, 'g');
            if (content.match(classAndComponentRegex)) {
                path = candidateFile
                    .slice(0, candidateFile.lastIndexOf('/'))
                    .replace(moduleFolderPath, '.');
                componentFileName = candidateFile.slice(candidateFile.lastIndexOf('/') + 1, candidateFile.lastIndexOf('.'));
                break;
            }
        }
    }
    if (path === null) {
        console.warn(`Couldn't resolve "${symbolName}" imported from ${dir} relative to ${moduleFolderPath}.`);
        return undefined;
    }
    return {
        componentFileName,
        moduleFolderPath,
        name: symbolName,
        path,
        entryPointName: entryPoint.name,
    };
}
function getFullComponentFilePath(moduleFolderPath, componentFilePath) {
    if (moduleFolderPath.startsWith('/')) {
        moduleFolderPath = moduleFolderPath.slice(1, moduleFolderPath.length);
    }
    return (0, devkit_1.joinPathFragments)(moduleFolderPath, componentFilePath);
}
