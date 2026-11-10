"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const app_components_info_1 = require("../../utils/app-components-info");
const artifact_types_1 = require("../../utils/artifact-types");
const project_1 = require("../../utils/project");
function normalizeOptions(tree, options) {
    const componentType = (0, artifact_types_1.getComponentType)(tree);
    const componentFileSuffix = componentType ? `.${componentType}` : '';
    const moduleTypeSeparator = (0, artifact_types_1.getModuleTypeSeparator)(tree);
    const entryModuleFileName = `entry${moduleTypeSeparator}module`;
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.appName);
    return {
        ...options,
        typescriptConfiguration: options.typescriptConfiguration ?? true,
        federationType: options.federationType ?? 'static',
        prefix: options.prefix ?? (0, project_1.getProjectPrefix)(tree, options.appName) ?? 'app',
        standalone: options.standalone ?? true,
        componentType: componentType ? (0, devkit_1.names)(componentType).className : '',
        componentFileSuffix,
        entryModuleFileName,
        appComponentInfo: (0, app_components_info_1.getAppComponentInfo)(tree, componentFileSuffix, project),
        nxWelcomeComponentInfo: (0, app_components_info_1.getNxWelcomeComponentInfo)(tree, componentFileSuffix, project),
    };
}
