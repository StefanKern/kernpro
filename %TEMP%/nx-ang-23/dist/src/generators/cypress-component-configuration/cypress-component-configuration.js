"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cypressComponentConfiguration = cypressComponentConfiguration;
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const assert_cypress_component_testing_support_1 = require("../../utils/assert-cypress-component-testing-support");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const zoneless_1 = require("../../utils/zoneless");
const versions_1 = require("../../utils/versions");
const component_test_1 = require("../component-test/component-test");
const component_info_1 = require("../utils/storybook-ast/component-info");
const entry_point_1 = require("../utils/storybook-ast/entry-point");
const module_info_1 = require("../utils/storybook-ast/module-info");
const update_app_editor_tsconfig_excluded_files_1 = require("../utils/update-app-editor-tsconfig-excluded-files");
const semver_1 = require("semver");
const webpackExecutors = new Set([
    '@nx/angular:webpack-browser',
    '@nrwl/angular:webpack-browser',
    '@angular-devkit/build-angular:browser',
]);
const esbuildExecutors = new Set([
    '@angular/build:application',
    '@angular-devkit/build-angular:application',
    '@nx/angular:application',
    '@angular-devkit/build-angular:browser-esbuild',
    '@nx/angular:browser-esbuild',
]);
/**
 * This is for cypress built in component testing, if you want to test with
 * storybook + cypress then use the componentCypressGenerator instead.
 */
async function cypressComponentConfiguration(tree, options) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    const { componentConfigurationGenerator: baseCyCTConfig } = (0, devkit_1.ensurePackage)('@nx/cypress', versions_1.nxVersion);
    (0, assert_cypress_component_testing_support_1.assertCypressComponentTestingSupport)(tree);
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    let isZoneless;
    if (projectConfig.projectType === 'application') {
        // For applications, check the polyfills in the build target
        isZoneless = (0, zoneless_1.isZonelessApp)(projectConfig);
    }
    else {
        // For libraries, check if zone.js is installed in the workspace
        isZoneless = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'zone.js') === null;
    }
    // Cypress 16 dropped `cypress/angular-zoneless`; `cypress/angular` is zoneless there.
    let mountModule = 'cypress/angular';
    if (isZoneless) {
        const { getInstalledCypressVersion, } = require('@nx/cypress/internal');
        const installedCypressVersion = getInstalledCypressVersion(tree);
        // If Cypress is not yet installed, we'll install the latest version, which will have zoneless support
        if (installedCypressVersion && (0, semver_1.major)(installedCypressVersion) < 16) {
            // Zoneless support was introduced in Cypress 15.8.0
            const unsupportedCypressVersion = (0, assert_cypress_component_testing_support_1.findCypressBelow)(tree, '15.8.0');
            if (unsupportedCypressVersion) {
                throw new Error(`Cypress Component Testing doesn't support Zoneless Angular projects for your Cypress version (${unsupportedCypressVersion}). ` +
                    `The project "${options.project}" is configured without Zone.js. ` +
                    `Please upgrade Cypress to version 15.8.0 or higher.`);
            }
            mountModule = 'cypress/angular-zoneless';
        }
    }
    const tasks = [];
    tasks.push(await baseCyCTConfig(tree, {
        project: options.project,
        skipFormat: true,
        addPlugin: false,
        addExplicitTargets: true,
        skipPackageJson: options.skipPackageJson,
    }));
    await configureCypressCT(tree, options);
    tasks.push(await addFiles(tree, projectConfig, options, mountModule));
    if (projectConfig.projectType === 'application') {
        (0, update_app_editor_tsconfig_excluded_files_1.updateAppEditorTsConfigExcludedFiles)(tree, projectConfig);
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
async function addFiles(tree, projectConfig, options, mountModule) {
    const componentFile = (0, devkit_1.joinPathFragments)(projectConfig.root, 'cypress', 'support', 'component.ts');
    const { addMountDefinition } = (require('@nx/cypress/internal'));
    const updatedCmpContents = await addMountDefinition(tree.read(componentFile, 'utf-8'));
    tree.write(componentFile, `import { mount } from '${mountModule}';\n${updatedCmpContents}`);
    if (!options.generateTests) {
        return () => { };
    }
    const entryPoints = (0, entry_point_1.getProjectEntryPoints)(tree, options.project);
    const componentInfo = [];
    for (const entryPoint of entryPoints) {
        const moduleFilePaths = (0, module_info_1.getModuleFilePaths)(tree, entryPoint);
        componentInfo.push(...(0, component_info_1.getComponentsInfo)(tree, entryPoint, moduleFilePaths, options.project), ...(0, component_info_1.getStandaloneComponentsInfo)(tree, entryPoint));
    }
    let ctTask;
    for (const info of componentInfo) {
        if (info === undefined) {
            continue;
        }
        const componentDirFromProjectRoot = (0, path_1.relative)(projectConfig.root, (0, devkit_1.joinPathFragments)(info.moduleFolderPath, info.path));
        const task = await (0, component_test_1.componentTestGenerator)(tree, {
            project: options.project,
            componentName: info.name,
            componentDir: componentDirFromProjectRoot,
            componentFileName: info.componentFileName,
            skipFormat: true,
            skipPackageJson: options.skipPackageJson,
        });
        // the ct generator only installs one dependency, which will only be installed
        // if !skipPackageJson and not already installed, so only the first run can
        // result in a generator callback that would actually install the dependency
        if (!ctTask) {
            ctTask = task;
        }
    }
    return ctTask ?? (() => { });
}
async function configureCypressCT(tree, options) {
    let found = { target: options.buildTarget, config: undefined };
    if (!options.buildTarget) {
        const { findBuildConfig } = (require('@nx/cypress/internal'));
        found = await findBuildConfig(tree, {
            project: options.project,
            buildTarget: options.buildTarget,
            validExecutorNames: webpackExecutors,
        });
        if (!found?.config) {
            // Check if the project uses an esbuild-based executor
            const esbuildTarget = await findBuildConfig(tree, {
                project: options.project,
                validExecutorNames: esbuildExecutors,
                skipGetOptions: true,
            });
            if (esbuildTarget?.target) {
                const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, esbuildTarget.target.split(':')[0]);
                const targetName = esbuildTarget.target.split(':')[1];
                const executor = projectConfig.targets?.[targetName]?.executor;
                throw new Error(`Cypress Component Testing for Angular requires a webpack-based build target, ` +
                    `but the project "${options.project}" uses an esbuild-based executor (${executor}).\n\n` +
                    `Cypress only supports webpack as the bundler for Angular component testing.`);
            }
            throw new Error('Unable to find a valid build configuration. Try passing in a target for an Angular app (e.g. --build-target=<project>:<target>[:<configuration>]).');
        }
    }
    const ctConfigOptions = {};
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    if (projectConfig.targets?.['component-test']?.executor ===
        '@nx/cypress:cypress') {
        projectConfig.targets['component-test'].options = {
            ...projectConfig.targets['component-test'].options,
            skipServe: true,
            devServerTarget: found.target,
        };
        (0, devkit_1.updateProjectConfiguration)(tree, options.project, projectConfig);
    }
    else {
        ctConfigOptions.buildTarget = found.target;
    }
    const { addDefaultCTConfig, getProjectCypressConfigPath, getInstalledCypressMajorVersion, } = require('@nx/cypress/internal');
    const cypressConfigPath = getProjectCypressConfigPath(tree, projectConfig.root);
    const updatedCyConfig = await addDefaultCTConfig(tree.read(cypressConfigPath, 'utf-8'), ctConfigOptions, '@nx/angular/plugins/component-testing', getInstalledCypressMajorVersion(tree));
    tree.write(cypressConfigPath, updatedCyConfig);
}
exports.default = cypressComponentConfiguration;
