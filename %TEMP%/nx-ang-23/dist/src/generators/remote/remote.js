"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remote = remote;
const tslib_1 = require("tslib");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/eslint/internal");
const devkit_1 = require("@nx/devkit");
const internal_3 = require("@nx/js/internal");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const test_runners_1 = require("../../utils/test-runners");
const application_1 = require("../application/application");
const convert_to_rspack_1 = tslib_1.__importDefault(require("../convert-to-rspack/convert-to-rspack"));
const setup_mf_1 = require("../setup-mf/setup-mf");
const add_mf_env_to_inputs_1 = require("../utils/add-mf-env-to-inputs");
const assert_mf_utils_1 = require("../utils/assert-mf-utils");
const validations_1 = require("../utils/validations");
const version_utils_1 = require("../utils/version-utils");
const lib_1 = require("./lib");
async function remote(tree, schema) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    (0, validations_1.assertNotUsingTsSolutionSetup)(tree, 'remote');
    (0, lib_1.validateOptions)(tree, schema);
    // TODO: Replace with Rspack when confidence is high enough
    schema.bundler ??= 'webpack';
    const isRspack = schema.bundler === 'rspack';
    (0, assert_mf_utils_1.assertRspackIsCSR)(schema.bundler, schema.ssr ?? false);
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    schema.zoneless ??= angularMajorVersion >= 21 ? true : false;
    const { typescriptConfiguration = true, ...options } = schema;
    options.standalone = options.standalone ?? true;
    const projects = (0, devkit_1.getProjects)(tree);
    if (options.host && !projects.has(options.host)) {
        throw new Error(`The name of the application to be used as the host app does not exist. (${options.host})`);
    }
    await (0, internal_1.ensureRootProjectName)(options, 'application');
    const { projectName: remoteProjectName } = await (0, internal_1.determineProjectNameAndRootOptions)(tree, {
        name: options.name,
        projectType: 'application',
        directory: options.directory,
    });
    const REMOTE_NAME_REGEX = '^[a-zA-Z_$][a-zA-Z_$0-9]*$';
    const remoteNameRegex = new RegExp(REMOTE_NAME_REGEX);
    if (!remoteNameRegex.test(remoteProjectName)) {
        throw new Error((0, devkit_1.stripIndents) `Invalid remote name: ${remoteProjectName}. Remote project names must:
       - Start with a letter, dollar sign ($) or underscore (_)
       - Followed by any valid character (letters, digits, underscores, or dollar signs)
      The regular expression used is ${REMOTE_NAME_REGEX}.`);
    }
    const port = options.port ?? (0, lib_1.findNextAvailablePort)(tree);
    const appInstallTask = await (0, application_1.applicationGenerator)(tree, {
        ...options,
        standalone: options.standalone,
        routing: true,
        port,
        skipFormat: true,
        bundler: 'webpack',
    });
    const skipE2E = !options.e2eTestRunner || options.e2eTestRunner === test_runners_1.E2eTestRunner.None;
    await (0, setup_mf_1.setupMf)(tree, {
        appName: remoteProjectName,
        mfType: 'remote',
        routing: true,
        host: options.host,
        port,
        skipPackageJson: options.skipPackageJson,
        skipFormat: true,
        skipE2E,
        e2eProjectName: skipE2E ? undefined : `${remoteProjectName}-e2e`,
        standalone: options.standalone,
        prefix: options.prefix,
        typescriptConfiguration,
        enableTypedLinting: (0, internal_2.isTypedLintingEnabled)(options),
    });
    const installTasks = [appInstallTask];
    if (!options.skipPackageJson) {
        const installSwcHelpersTask = (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
            '@swc/helpers': internal_3.swcHelpersVersion,
        });
        installTasks.push(installSwcHelpersTask);
    }
    if (options.ssr) {
        let ssrInstallTask = await (0, lib_1.updateSsrSetup)(tree, {
            appName: remoteProjectName,
            port,
            typescriptConfiguration,
            standalone: options.standalone,
            skipPackageJson: options.skipPackageJson,
            zoneless: options.zoneless,
        });
        installTasks.push(ssrInstallTask);
    }
    (0, add_mf_env_to_inputs_1.addMfEnvToTargetDefaultInputs)(tree);
    if (isRspack) {
        await (0, convert_to_rspack_1.default)(tree, {
            project: remoteProjectName,
            skipInstall: options.skipPackageJson,
            skipFormat: true,
        });
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, remoteProjectName);
    project.targets.serve ??= {};
    project.targets.serve.options ??= {};
    if (options.host) {
        project.targets.serve.dependsOn ??= [];
        project.targets.serve.dependsOn.push(`${options.host}:serve`);
    }
    project.targets.serve.options.port = port;
    (0, devkit_1.updateProjectConfiguration)(tree, remoteProjectName, project);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...installTasks);
}
exports.default = remote;
