"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentTestGenerator = componentTestGenerator;
const devkit_1 = require("@nx/devkit");
const assert_cypress_component_testing_support_1 = require("../../utils/assert-cypress-component-testing-support");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const versions_1 = require("../../utils/versions");
const storybook_inputs_1 = require("../utils/storybook-ast/storybook-inputs");
const version_utils_1 = require("../utils/version-utils");
async function componentTestGenerator(tree, options) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    (0, devkit_1.ensurePackage)('@nx/cypress', versions_1.nxVersion);
    (0, assert_cypress_component_testing_support_1.assertCypressComponentTestingSupport)(tree);
    const { root } = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const componentDirPath = (0, devkit_1.joinPathFragments)(root, options.componentDir);
    const componentFilePath = (0, devkit_1.joinPathFragments)(componentDirPath, `${options.componentFileName}.ts`);
    const componentTestFilePath = (0, devkit_1.joinPathFragments)(componentDirPath, `${options.componentFileName}.cy.ts`);
    if (tree.exists(componentFilePath) && !tree.exists(componentTestFilePath)) {
        const props = (0, storybook_inputs_1.getComponentProps)(tree, componentFilePath, storybook_inputs_1.getArgsDefaultValue, false);
        (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, 'files'), componentDirPath, {
            componentName: options.componentName,
            componentFileName: options.componentFileName.startsWith('./')
                ? options.componentFileName.slice(2)
                : options.componentFileName,
            props: props.filter((p) => typeof p.defaultValue !== 'undefined'),
            tpl: '',
        });
    }
    const tasks = [];
    if (!options.skipPackageJson && usesPlatformBrowserDynamic(tree)) {
        tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
            '@angular/platform-browser-dynamic': (0, version_utils_1.versions)(tree).angularVersion,
        }, undefined, true));
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
// The Cypress 16 harness bootstraps through @angular/platform-browser/testing;
// earlier harnesses need @angular/platform-browser-dynamic/testing.
function usesPlatformBrowserDynamic(tree) {
    const { getInstalledCypressMajorVersion, } = require('@nx/cypress/internal');
    const cypressMajorVersion = getInstalledCypressMajorVersion(tree);
    return cypressMajorVersion !== null && cypressMajorVersion < 16;
}
exports.default = componentTestGenerator;
