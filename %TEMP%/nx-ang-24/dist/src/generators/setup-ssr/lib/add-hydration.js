"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addHydration = addHydration;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const internal_1 = require("@nx/js/internal");
const ast_utils_1 = require("../../../utils/nx-devkit/ast-utils");
let tsModule;
let tsquery;
function addHydration(tree, options) {
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const sourceRoot = (0, internal_1.getProjectSourceRoot)(projectConfig, tree);
    if (!tsModule) {
        tsModule = (0, internal_1.ensureTypescript)();
        tsquery = require('@phenomnomnominal/tsquery').tsquery;
    }
    let pathToClientConfigFile;
    if (options.standalone) {
        pathToClientConfigFile = (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app.config.ts');
    }
    else {
        pathToClientConfigFile = (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app.module.ts');
        if (!tree.exists(pathToClientConfigFile)) {
            pathToClientConfigFile = (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app-module.ts');
        }
    }
    const sourceText = tree.read(pathToClientConfigFile, 'utf-8');
    let sourceFile = tsModule.createSourceFile(pathToClientConfigFile, sourceText, tsModule.ScriptTarget.Latest, true);
    const provideClientHydrationCallExpression = tsquery(sourceFile, 'ObjectLiteralExpression PropertyAssignment:has(Identifier[name=providers]) ArrayLiteralExpression CallExpression:has(Identifier[name=provideClientHydration])')[0];
    if (provideClientHydrationCallExpression) {
        return;
    }
    const addImport = (source, symbolName, packageName, filePath, isDefault = false) => {
        return (0, js_1.insertImport)(tree, source, filePath, symbolName, packageName, isDefault);
    };
    sourceFile = addImport(sourceFile, 'provideClientHydration', '@angular/platform-browser', pathToClientConfigFile);
    sourceFile = addImport(sourceFile, 'withEventReplay', '@angular/platform-browser', pathToClientConfigFile);
    const provider = 'provideClientHydration(withEventReplay())';
    if (options.standalone) {
        (0, ast_utils_1.addProviderToAppConfig)(tree, pathToClientConfigFile, provider);
    }
    else {
        (0, ast_utils_1.addProviderToModule)(tree, sourceFile, pathToClientConfigFile, provider);
    }
}
