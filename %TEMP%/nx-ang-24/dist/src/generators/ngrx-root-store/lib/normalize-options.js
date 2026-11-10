"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
const ast_utils_1 = require("../../../utils/nx-devkit/ast-utils");
const internal_2 = require("@nx/js/internal");
function normalizeOptions(tree, options) {
    let rxjsVersion;
    try {
        const rxjsVersionFromPackageJson = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'rxjs', 'package.json', ['dependencies']);
        rxjsVersion = (0, internal_1.checkAndCleanWithSemver)(tree, 'rxjs', rxjsVersionFromPackageJson);
    }
    catch {
        rxjsVersion = (0, internal_1.checkAndCleanWithSemver)(tree, 'rxjs', versions_1.rxjsVersion);
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const isStandalone = (0, ast_utils_1.isNgStandaloneApp)(tree, options.project);
    const sourceRoot = (0, internal_2.getProjectSourceRoot)(project, tree);
    const appConfigPath = (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app.config.ts');
    let appMainPath = project.targets.build.options.main ?? project.targets.build.options.browser;
    if (!appMainPath) {
        appMainPath = (0, devkit_1.joinPathFragments)(sourceRoot, 'main.ts');
    }
    /** If NgModule App
     * -> Use App Module
     * If Standalone
     * -> Check Config File exists (v16+)
     * --> If so, use that
     * --> If not, use main.ts
     */
    let ngModulePath = (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app.module.ts');
    if (!tree.exists(ngModulePath)) {
        ngModulePath = (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app-module.ts');
    }
    const parent = !isStandalone && tree.exists(ngModulePath)
        ? ngModulePath
        : tree.exists(appConfigPath)
            ? appConfigPath
            : appMainPath;
    options.directory = options.directory ?? '+state';
    return {
        ...options,
        parent,
        directory: (0, devkit_1.names)(options.directory).fileName,
        rxjsVersion,
    };
}
