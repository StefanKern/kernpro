"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.host = host;
const tslib_1 = require("tslib");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/eslint/internal");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const internal_3 = require("@nx/js/internal");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const test_runners_1 = require("../../utils/test-runners");
const application_1 = tslib_1.__importDefault(require("../application/application"));
const convert_to_rspack_1 = tslib_1.__importDefault(require("../convert-to-rspack/convert-to-rspack"));
const remote_1 = tslib_1.__importDefault(require("../remote/remote"));
const setup_mf_1 = require("../setup-mf/setup-mf");
const add_mf_env_to_inputs_1 = require("../utils/add-mf-env-to-inputs");
const assert_mf_utils_1 = require("../utils/assert-mf-utils");
const validations_1 = require("../utils/validations");
const version_utils_1 = require("../utils/version-utils");
const lib_1 = require("./lib");
async function host(tree, schema) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    (0, validations_1.assertNotUsingTsSolutionSetup)(tree, 'host');
    (0, lib_1.validateOptions)(tree, schema);
    // TODO: Replace with Rspack when confidence is high enough
    schema.bundler ??= 'webpack';
    const isRspack = schema.bundler === 'rspack';
    (0, assert_mf_utils_1.assertRspackIsCSR)(schema.bundler, schema.ssr ?? false);
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    schema.zoneless ??= angularMajorVersion >= 21 ? true : false;
    const { typescriptConfiguration = true, ...options } = schema;
    options.standalone = options.standalone ?? true;
    // Resolved before delegating so the host and every generated remote share one
    // answer. `applicationGenerator` returns a new object rather than mutating
    // this one, so resolving there would ask again for each remote.
    options.linter = await (0, internal_3.normalizeLinterOption)(tree, options.linter);
    const projects = (0, devkit_1.getProjects)(tree);
    const remotesToGenerate = [];
    const remotesToIntegrate = [];
    // Check to see if remotes are provided and also check if --dynamic is provided
    // if both are check that the remotes are valid names else throw an error.
    if (options.dynamic && options.remotes?.length > 0) {
        options.remotes.forEach((remote) => {
            const isValidRemote = (0, js_1.isValidVariable)(remote);
            if (!isValidRemote.isValid) {
                throw new Error(`Invalid remote name provided: ${remote}. ${isValidRemote.message}`);
            }
        });
    }
    if (options.remotes && options.remotes.length > 0) {
        options.remotes.forEach((remote) => {
            if (!projects.has(remote)) {
                remotesToGenerate.push(remote);
            }
            else {
                remotesToIntegrate.push(remote);
            }
        });
    }
    await (0, internal_1.ensureRootProjectName)(options, 'application');
    const { projectName: hostProjectName, projectRoot: appRoot } = await (0, internal_1.determineProjectNameAndRootOptions)(tree, {
        name: options.name,
        projectType: 'application',
        directory: options.directory,
    });
    const hostPort = options.port ?? 4200;
    const appInstallTask = await (0, application_1.default)(tree, {
        ...options,
        standalone: options.standalone,
        routing: true,
        port: hostPort,
        skipFormat: true,
        bundler: 'webpack',
    });
    const skipE2E = !options.e2eTestRunner || options.e2eTestRunner === test_runners_1.E2eTestRunner.None;
    await (0, setup_mf_1.setupMf)(tree, {
        appName: hostProjectName,
        mfType: 'host',
        routing: true,
        port: hostPort,
        remotes: remotesToIntegrate ?? [],
        federationType: options.dynamic ? 'dynamic' : 'static',
        skipPackageJson: options.skipPackageJson,
        skipFormat: true,
        skipE2E,
        e2eProjectName: skipE2E ? undefined : `${hostProjectName}-e2e`,
        prefix: options.prefix,
        typescriptConfiguration,
        standalone: options.standalone,
        enableTypedLinting: (0, internal_2.isTypedLintingEnabled)(options),
    });
    let installTasks = [appInstallTask];
    if (options.ssr) {
        let ssrInstallTask = await (0, lib_1.updateSsrSetup)(tree, options, hostProjectName, typescriptConfiguration);
        installTasks.push(ssrInstallTask);
    }
    for (let i = 0; i < remotesToGenerate.length; i++) {
        const remote = remotesToGenerate[i];
        const remoteDirectory = options.directory
            ? (0, devkit_1.joinPathFragments)(options.directory, '..', remote)
            : appRoot === '.'
                ? remote
                : (0, devkit_1.joinPathFragments)(appRoot, '..', remote);
        await (0, remote_1.default)(tree, {
            ...options,
            name: remote,
            directory: remoteDirectory,
            host: hostProjectName,
            port: isRspack ? hostPort + i + 1 : undefined,
            skipFormat: true,
            standalone: options.standalone,
            typescriptConfiguration,
        });
    }
    (0, add_mf_env_to_inputs_1.addMfEnvToTargetDefaultInputs)(tree);
    if (isRspack) {
        await (0, convert_to_rspack_1.default)(tree, {
            project: hostProjectName,
            skipInstall: options.skipPackageJson,
            skipFormat: true,
        });
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, hostProjectName);
    project.targets.serve ??= {};
    project.targets.serve.options ??= {};
    project.targets.serve.options.port = hostPort;
    (0, devkit_1.updateProjectConfiguration)(tree, hostProjectName, project);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...installTasks);
}
exports.default = host;
