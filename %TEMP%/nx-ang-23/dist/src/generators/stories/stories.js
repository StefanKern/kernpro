"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.angularStoriesGenerator = angularStoriesGenerator;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const component_story_1 = tslib_1.__importDefault(require("../component-story/component-story"));
const component_info_1 = require("../utils/storybook-ast/component-info");
const entry_point_1 = require("../utils/storybook-ast/entry-point");
const module_info_1 = require("../utils/storybook-ast/module-info");
const picomatch = require("picomatch");
async function angularStoriesGenerator(tree, options) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    const entryPoints = (0, entry_point_1.getProjectEntryPoints)(tree, options.name);
    const componentsInfo = [];
    for (const entryPoint of entryPoints) {
        const moduleFilePaths = (0, module_info_1.getModuleFilePaths)(tree, entryPoint);
        componentsInfo.push(...(0, component_info_1.getComponentsInfo)(tree, entryPoint, moduleFilePaths, options.name), ...(0, component_info_1.getStandaloneComponentsInfo)(tree, entryPoint));
    }
    const componentInfos = componentsInfo.filter((f) => !options.ignorePaths?.some((pattern) => {
        const shouldIgnorePath = picomatch(pattern)((0, devkit_1.joinPathFragments)(f.moduleFolderPath, f.path, `${f.componentFileName}.ts`));
        return shouldIgnorePath;
    }));
    for (const info of componentInfos) {
        if (info === undefined) {
            continue;
        }
        await (0, component_story_1.default)(tree, {
            projectPath: info.moduleFolderPath,
            componentName: info.name,
            componentPath: info.path,
            componentFileName: info.componentFileName,
            interactionTests: options.interactionTests ?? true,
            skipFormat: true,
        });
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
}
exports.default = angularStoriesGenerator;
