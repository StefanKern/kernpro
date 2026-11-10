"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addServerFile = addServerFile;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const path_1 = require("path");
const zoneless_1 = require("../../../utils/zoneless");
const version_utils_1 = require("../../utils/version-utils");
const constants_1 = require("./constants");
function addServerFile(tree, options) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const { outputPath } = project.targets.build.options;
    const usesApplicationEngine = options.isUsingApplicationBuilder || options.isRspack;
    let browserDistDirectory;
    if (options.isRspack) {
        // rspack always emits the browser bundle under the default directory name
        browserDistDirectory = constants_1.DEFAULT_BROWSER_DIR;
    }
    else if (options.isUsingApplicationBuilder) {
        browserDistDirectory = getApplicationBuilderBrowserOutputPath(outputPath);
    }
    else {
        browserDistDirectory = outputPath;
    }
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    const pathToFiles = (0, path_1.join)(__dirname, '..', 'files', 'v20+', usesApplicationEngine ? 'application-builder' : 'server-builder', 'server');
    const sourceRoot = (0, internal_1.getProjectSourceRoot)(project, tree);
    const zoneless = (0, zoneless_1.isZonelessApp)(project);
    (0, devkit_1.generateFiles)(tree, pathToFiles, sourceRoot, {
        ...options,
        browserDistDirectory,
        zoneless,
        useDefaultImport: angularMajorVersion >= 21,
        angularMajorVersion,
        supportsAllowedHosts: (0, version_utils_1.supportsSsrAllowedHosts)(tree),
        tpl: '',
    });
}
function getApplicationBuilderBrowserOutputPath(outputPath) {
    if (outputPath) {
        if (typeof outputPath === 'string') {
            // when `outputPath` is a string, it's the base path, so we return the default browser path
            return constants_1.DEFAULT_BROWSER_DIR;
        }
        return outputPath.browser ?? constants_1.DEFAULT_BROWSER_DIR;
    }
    return constants_1.DEFAULT_BROWSER_DIR;
}
