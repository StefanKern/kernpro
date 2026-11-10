"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSSRFiles = generateSSRFiles;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const path_1 = require("path");
const semver_1 = require("semver");
const app_components_info_1 = require("../../utils/app-components-info");
const artifact_types_1 = require("../../utils/artifact-types");
const version_utils_1 = require("../../utils/version-utils");
function generateSSRFiles(tree, options) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    if (project.targets.server ||
        (options.isUsingApplicationBuilder &&
            project.targets.build.options?.server !== undefined)) {
        // server has already been added
        return;
    }
    const { version: angularVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    const pathToFiles = (0, path_1.join)(__dirname, '..', 'files', 'v20+', options.isUsingApplicationBuilder || options.isRspack
        ? 'application-builder'
        : 'server-builder', options.standalone ? 'standalone-src' : 'ngmodule-src');
    const sourceRoot = (0, internal_1.getProjectSourceRoot)(project, tree);
    const componentType = (0, artifact_types_1.getComponentType)(tree);
    const appComponentInfo = (0, app_components_info_1.getAppComponentInfo)(tree, componentType ? `.${componentType}` : '', project);
    const moduleTypeSeparator = (0, artifact_types_1.getModuleTypeSeparator)(tree);
    // https://github.com/angular/angular-cli/releases/tag/20.3.0
    const useBootstrapContext = (0, semver_1.gte)(angularVersion, '20.3.0');
    (0, devkit_1.generateFiles)(tree, pathToFiles, sourceRoot, {
        ...options,
        appFileName: appComponentInfo.extensionlessFileName,
        appSymbolName: appComponentInfo.symbolName,
        moduleTypeSeparator,
        useBootstrapContext,
        tpl: '',
    });
}
