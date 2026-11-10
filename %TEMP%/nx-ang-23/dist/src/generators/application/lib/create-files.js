"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiles = createFiles;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const test_runners_1 = require("../../../utils/test-runners");
const artifact_types_1 = require("../../utils/artifact-types");
const selector_1 = require("../../utils/selector");
const update_project_root_tsconfig_1 = require("../../utils/update-project-root-tsconfig");
const internal_1 = require("@nx/devkit/internal");
async function createFiles(tree, options, rootOffset) {
    const rootSelector = `${options.prefix}-root`;
    (0, selector_1.validateHtmlSelector)(rootSelector);
    const nxWelcomeSelector = `${options.prefix}-nx-welcome`;
    (0, selector_1.validateHtmlSelector)(nxWelcomeSelector);
    const onBoardingStatus = await (0, internal_1.createNxCloudOnboardingURLForWelcomeApp)(tree, options.nxCloudToken);
    const connectCloudUrl = onBoardingStatus === 'unclaimed' &&
        (await (0, internal_1.getNxCloudAppOnBoardingUrl)(options.nxCloudToken));
    const componentType = (0, artifact_types_1.getComponentType)(tree);
    const componentFileSuffix = componentType ? `.${componentType}` : '';
    const moduleTypeSeparator = (0, artifact_types_1.getModuleTypeSeparator)(tree);
    const substitutions = {
        rootSelector,
        appName: options.name,
        inlineStyle: options.inlineStyle,
        inlineTemplate: options.inlineTemplate,
        style: options.style,
        viewEncapsulation: options.viewEncapsulation,
        unitTesting: options.unitTestRunner !== test_runners_1.UnitTestRunner.None,
        routing: options.routing,
        minimal: options.minimal,
        nxWelcomeSelector,
        rootTsConfig: (0, devkit_1.joinPathFragments)(rootOffset, (0, js_1.getRootTsConfigFileName)(tree)),
        rootOffset,
        componentType: componentType ? (0, devkit_1.names)(componentType).className : '',
        componentFileSuffix,
        moduleTypeSeparator,
        zoneless: options.zoneless,
        connectCloudUrl,
        tutorialUrl: options.standalone
            ? 'https://nx.dev/getting-started/tutorials/angular-standalone-tutorial?utm_source=nx-project'
            : 'https://nx.dev/getting-started/tutorials/angular-monorepo-tutorial?utm_source=nx-project',
        tpl: '',
    };
    const angularAppType = options.standalone ? 'standalone' : 'ng-module';
    (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, '../files/base'), options.appProjectRoot, substitutions);
    if (options.standalone) {
        (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, '../files/standalone-components'), options.appProjectRoot, substitutions);
    }
    else {
        (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, '../files/ng-module'), options.appProjectRoot, substitutions);
    }
    (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, '../files/nx-welcome', onBoardingStatus, angularAppType), options.appProjectRoot, substitutions);
    (0, update_project_root_tsconfig_1.updateProjectRootTsConfig)(tree, options.appProjectRoot, (0, js_1.getRelativePathToRootTsConfig)(tree, options.appProjectRoot), options.rootProject);
    if (!options.routing) {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, '/src/app/app.routes.ts'));
    }
    if (options.skipTests || options.unitTestRunner === test_runners_1.UnitTestRunner.None) {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, `src/app/app${componentFileSuffix}.spec.ts`));
    }
    if (options.inlineTemplate) {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, `src/app/app${componentFileSuffix}.html`));
    }
    if (options.inlineStyle) {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, `src/app/app${componentFileSuffix}.${options.style}`));
    }
    if (options.minimal) {
        tree.delete((0, devkit_1.joinPathFragments)(options.appProjectRoot, `src/app/nx-welcome${componentFileSuffix}.ts`));
    }
}
