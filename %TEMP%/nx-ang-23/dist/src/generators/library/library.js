"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.libraryGenerator = libraryGenerator;
const tslib_1 = require("tslib");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/eslint/internal");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const internal_3 = require("@nx/js/internal");
const init_1 = tslib_1.__importDefault(require("../../generators/init/init"));
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const test_runners_1 = require("../../utils/test-runners");
const add_linting_1 = tslib_1.__importDefault(require("../add-linting/add-linting"));
const acknowledge_build_scripts_1 = require("../utils/acknowledge-build-scripts");
const add_jest_1 = require("../utils/add-jest");
const add_vitest_1 = require("../utils/add-vitest");
const dependencies_1 = require("../utils/dependencies");
const ensure_angular_dependencies_1 = require("../utils/ensure-angular-dependencies");
const validations_1 = require("../utils/validations");
const version_utils_1 = require("../utils/version-utils");
const add_module_1 = require("./lib/add-module");
const add_project_1 = require("./lib/add-project");
const add_standalone_component_1 = require("./lib/add-standalone-component");
const create_files_1 = require("./lib/create-files");
const normalize_options_1 = require("./lib/normalize-options");
const set_generator_defaults_1 = require("./lib/set-generator-defaults");
const update_lib_package_npm_scope_1 = require("./lib/update-lib-package-npm-scope");
const update_tsconfig_files_1 = require("./lib/update-tsconfig-files");
const validate_options_1 = require("./lib/validate-options");
async function libraryGenerator(tree, schema) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    (0, validations_1.assertNotUsingTsSolutionSetup)(tree, 'library');
    (0, validate_options_1.validateOptions)(tree, schema);
    const options = await (0, normalize_options_1.normalizeOptions)(tree, schema);
    const { libraryOptions } = options;
    const pkgVersions = (0, version_utils_1.versions)(tree);
    await (0, js_1.initGenerator)(tree, {
        ...libraryOptions,
        js: false,
        skipFormat: true,
    });
    await (0, init_1.default)(tree, { ...libraryOptions, skipFormat: true });
    if (!libraryOptions.skipPackageJson) {
        // if zone.js is not installed, we'll never install it as a dependency
        // from the library generator
        (0, ensure_angular_dependencies_1.ensureAngularDependencies)(tree, /*zoneless*/ true);
    }
    const project = await (0, add_project_1.addProject)(tree, libraryOptions);
    (0, create_files_1.createFiles)(tree, options, project);
    const unitTestRunnerTask = await addUnitTestRunner(tree, libraryOptions);
    (0, update_tsconfig_files_1.updateTsConfigFiles)(tree, libraryOptions);
    updateNpmScopeIfBuildableOrPublishable(tree, libraryOptions);
    (0, set_generator_defaults_1.setGeneratorDefaults)(tree, options);
    if (!libraryOptions.standalone) {
        (0, add_module_1.addModule)(tree, libraryOptions);
    }
    else {
        await (0, add_standalone_component_1.addStandaloneComponent)(tree, options);
    }
    await addLinting(tree, libraryOptions);
    if ((libraryOptions.buildable || libraryOptions.publishable) &&
        !libraryOptions.skipPackageJson) {
        (0, acknowledge_build_scripts_1.acknowledgeAngularBuildScripts)(tree);
        (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
            'ng-packagr': pkgVersions.ngPackagrVersion,
        }, undefined, true);
        (0, dependencies_1.addBuildableLibrariesPostCssDependencies)(tree);
    }
    if (!libraryOptions.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    const tasks = [
        unitTestRunnerTask,
        () => (0, devkit_1.installPackagesTask)(tree),
    ];
    if (libraryOptions.publishable) {
        tasks.push(await (0, internal_3.releaseTasks)(tree));
    }
    tasks.push(() => (0, internal_1.logShowProjectCommand)(libraryOptions.name));
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
async function addUnitTestRunner(host, options) {
    const zoneless = (0, devkit_1.getDependencyVersionFromPackageJson)(host, 'zone.js') === null;
    switch (options.unitTestRunner) {
        case test_runners_1.UnitTestRunner.Jest:
            await (0, add_jest_1.addJest)(host, {
                name: options.name,
                projectRoot: options.projectRoot,
                skipPackageJson: options.skipPackageJson,
                strict: options.strict,
                runtimeTsconfigFileName: 'tsconfig.lib.json',
                zoneless,
            });
            return () => { };
        case test_runners_1.UnitTestRunner.VitestAngular:
            return (0, add_vitest_1.addVitestAngular)(host, {
                name: options.name,
                projectRoot: options.projectRoot,
                skipPackageJson: options.skipPackageJson,
                useNxUnitTestRunnerExecutor: true,
            });
        case test_runners_1.UnitTestRunner.VitestAnalog:
            return (0, add_vitest_1.addVitestAnalog)(host, {
                name: options.name,
                projectRoot: options.projectRoot,
                skipFormat: options.skipFormat,
                skipPackageJson: options.skipPackageJson,
                strict: options.strict,
                zoneless,
            });
        default:
            return () => { };
    }
}
function updateNpmScopeIfBuildableOrPublishable(host, options) {
    if (options.buildable || options.publishable) {
        (0, update_lib_package_npm_scope_1.updateLibPackageNpmScope)(host, options);
    }
}
async function addLinting(host, options) {
    if (options.linter === 'none') {
        return;
    }
    await (0, add_linting_1.default)(host, {
        linter: options.linter,
        projectName: options.name,
        projectRoot: options.projectRoot,
        prefix: options.prefix,
        unitTestRunner: options.unitTestRunner,
        enableTypedLinting: (0, internal_2.isTypedLintingEnabled)(options),
        skipFormat: true,
        skipPackageJson: options.skipPackageJson,
    });
}
exports.default = libraryGenerator;
