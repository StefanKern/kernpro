"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToRspack = convertToRspack;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const node_util_1 = require("node:util");
const path_1 = require("path");
const posix_1 = require("path/posix");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const versions_1 = require("../../utils/versions");
const acknowledge_build_scripts_1 = require("../utils/acknowledge-build-scripts");
const version_utils_1 = require("../utils/version-utils");
const create_config_1 = require("./lib/create-config");
const get_custom_webpack_config_1 = require("./lib/get-custom-webpack-config");
const merge_server_tsconfig_1 = require("./lib/merge-server-tsconfig");
const update_tsconfig_1 = require("./lib/update-tsconfig");
const validate_no_module_federation_1 = require("./lib/validate-no-module-federation");
const validate_supported_executor_1 = require("./lib/validate-supported-executor");
const SUPPORTED_EXECUTORS = [
    '@angular-devkit/build-angular:browser',
    '@angular-devkit/build-angular:dev-server',
    '@angular-devkit/build-angular:server',
    '@angular-devkit/build-angular:prerender',
    '@angular-devkit/build-angular:app-shell',
    '@nx/angular:webpack-browser',
    '@nx/angular:webpack-server',
    '@nx/angular:dev-server',
];
const RENAMED_OPTIONS = {
    main: 'browser',
    ngswConfigPath: 'serviceWorker',
};
const DEFAULT_PORT = 4200;
const REMOVED_OPTIONS = ['buildOptimizer', 'buildTarget', 'browserTarget'];
function normalizeFromProjectRoot(tree, path, projectRoot) {
    if (projectRoot === '.') {
        if (!path.startsWith('./')) {
            return `./${path}`;
        }
        else {
            return path;
        }
    }
    else if (path.startsWith(projectRoot)) {
        return path.replace(projectRoot, '.');
    }
    else if (!path.startsWith('./')) {
        if (tree.exists(path)) {
            const pathWithWorkspaceRoot = (0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, path);
            const projectRootWithWorkspaceRoot = (0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, projectRoot);
            return (0, path_1.relative)(projectRootWithWorkspaceRoot, pathWithWorkspaceRoot);
        }
        return `./${path}`;
    }
    return path;
}
const defaultNormalizer = (tree, path, root) => normalizeFromProjectRoot(tree, path, root);
const PATH_NORMALIZER = {
    index: (tree, path, root) => {
        if (typeof path === 'string') {
            return normalizeFromProjectRoot(tree, path, root);
        }
        return {
            input: normalizeFromProjectRoot(tree, path.input, root),
            output: path.output ?? 'index.html',
        };
    },
    indexHtmlTransformer: defaultNormalizer,
    main: defaultNormalizer,
    server: defaultNormalizer,
    tsConfig: defaultNormalizer,
    outputPath: (tree, path, root) => {
        const relativePathFromWorkspaceRoot = (0, path_1.relative)((0, devkit_1.joinPathFragments)(devkit_1.workspaceRoot, root), devkit_1.workspaceRoot);
        return (0, devkit_1.joinPathFragments)(relativePathFromWorkspaceRoot, path);
    },
    proxyConfig: defaultNormalizer,
    polyfills: (tree, paths, root) => {
        const normalizedPaths = [];
        const normalizeFn = (path) => {
            if (path.startsWith('zone.js')) {
                normalizedPaths.push(path);
                return;
            }
            try {
                const resolvedPath = require.resolve(path, {
                    paths: [(0, posix_1.join)(devkit_1.workspaceRoot, 'node_modules')],
                });
                normalizedPaths.push(path);
            }
            catch {
                normalizedPaths.push(normalizeFromProjectRoot(tree, path, root));
            }
        };
        if (typeof paths === 'string') {
            normalizeFn(paths);
        }
        else {
            for (const path of paths) {
                normalizeFn(path);
            }
        }
        return normalizedPaths;
    },
    styles: (tree, paths, root) => {
        const normalizedPaths = [];
        for (const path of paths) {
            if (typeof path === 'string') {
                normalizedPaths.push(normalizeFromProjectRoot(tree, path, root));
            }
            else {
                normalizedPaths.push({
                    input: normalizeFromProjectRoot(tree, path.input, root),
                    bundleName: path.bundleName,
                    inject: path.inject ?? true,
                });
            }
        }
        return normalizedPaths;
    },
    scripts: (tree, paths, root) => {
        const normalizedPaths = [];
        for (const path of paths) {
            if (typeof path === 'string') {
                normalizedPaths.push(normalizeFromProjectRoot(tree, path, root));
            }
            else {
                normalizedPaths.push({
                    input: normalizeFromProjectRoot(tree, path.input, root),
                    bundleName: path.bundleName,
                    inject: path.inject ?? true,
                });
            }
        }
        return normalizedPaths;
    },
    assets: (tree, paths, root) => {
        const normalizedPaths = [];
        for (const path of paths) {
            if (typeof path === 'string') {
                normalizedPaths.push(normalizeFromProjectRoot(tree, path, root));
            }
            else {
                normalizedPaths.push({
                    ...path,
                    input: normalizeFromProjectRoot(tree, path.input, root),
                });
            }
        }
        return normalizedPaths;
    },
    fileReplacements: (tree, paths, root) => {
        const normalizedPaths = [];
        for (const path of paths) {
            normalizedPaths.push({
                replace: normalizeFromProjectRoot(tree, 'src' in path ? path.src : path.replace, root),
                with: normalizeFromProjectRoot(tree, 'replaceWith' in path ? path.replaceWith : path.with, root),
            });
        }
        return normalizedPaths;
    },
};
function handleBuildTargetOptions(tree, options, newConfigurationOptions, root) {
    let customWebpackConfigPath;
    if (!options || Object.keys(options).length === 0) {
        return customWebpackConfigPath;
    }
    if (options.customWebpackConfig) {
        customWebpackConfigPath = options.customWebpackConfig.path;
        delete options.customWebpackConfig;
    }
    for (const [key, value] of Object.entries(options)) {
        let optionName = key;
        let optionValue = key in PATH_NORMALIZER ? PATH_NORMALIZER[key](tree, value, root) : value;
        if (REMOVED_OPTIONS.includes(key)) {
            continue;
        }
        if (key in RENAMED_OPTIONS) {
            optionName = RENAMED_OPTIONS[key];
        }
        newConfigurationOptions[optionName] = optionValue;
    }
    if (typeof newConfigurationOptions.polyfills === 'string') {
        newConfigurationOptions.polyfills = [newConfigurationOptions.polyfills];
    }
    let outputPath = newConfigurationOptions.outputPath;
    if (typeof outputPath === 'string') {
        if (!/\/browser\/?$/.test(outputPath)) {
            console.warn(`The output location of the browser build has been updated from "${outputPath}" to ` +
                `"${(0, posix_1.join)(outputPath, 'browser')}". ` +
                'You might need to adjust your deployment pipeline or, as an alternative, ' +
                'set outputPath.browser to "" in order to maintain the previous functionality.');
        }
        else {
            outputPath = outputPath.replace(/\/browser\/?$/, '');
        }
        newConfigurationOptions['outputPath'] = {
            base: outputPath,
        };
        if (typeof newConfigurationOptions.resourcesOutputPath === 'string') {
            const media = newConfigurationOptions.resourcesOutputPath.replaceAll('/', '');
            if (media && media !== 'media') {
                newConfigurationOptions['outputPath'] = {
                    base: outputPath,
                    media,
                };
            }
        }
    }
    return customWebpackConfigPath;
}
function handleDevServerTargetOptions(tree, options, newConfigurationOptions, root) {
    for (const [key, value] of Object.entries(options)) {
        let optionName = key;
        let optionValue = key in PATH_NORMALIZER ? PATH_NORMALIZER[key](tree, value, root) : value;
        if (REMOVED_OPTIONS.includes(key)) {
            continue;
        }
        if (key in RENAMED_OPTIONS) {
            optionName = RENAMED_OPTIONS[key];
        }
        newConfigurationOptions[optionName] = optionValue;
    }
}
async function getProjectToConvert(tree) {
    const projects = new Set();
    for (const executor of SUPPORTED_EXECUTORS) {
        (0, internal_1.forEachExecutorOptions)(tree, executor, (_, project) => {
            projects.add(project);
        });
    }
    return (0, internal_1.selectPrompt)({
        message: 'Which project would you like to convert to rspack?',
        choices: Array.from(projects),
    });
}
async function convertToRspack(tree, schema) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    let { project: projectName } = schema;
    if (!projectName) {
        projectName = await getProjectToConvert(tree);
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, projectName);
    const tasks = [];
    const createConfigOptions = {
        root: project.root,
    };
    const configurationOptions = {};
    let buildTarget;
    let serveTarget;
    const buildTsConfigPaths = new Set();
    let serverTsConfigPath;
    const targetsToRemove = [];
    let customWebpackConfigPath;
    (0, validate_supported_executor_1.validateSupportedBuildExecutor)(Object.values(project.targets));
    (0, validate_no_module_federation_1.validateNoModuleFederation)(tree, project);
    let projectServePort = DEFAULT_PORT;
    const projectServeConfigurationOptions = {};
    for (const [targetName, target] of Object.entries(project.targets)) {
        if (target.executor === '@angular-devkit/build-angular:browser' ||
            target.executor === '@nx/angular:webpack-browser') {
            customWebpackConfigPath = handleBuildTargetOptions(tree, target.options, createConfigOptions, project.root);
            if (target.options?.tsConfig) {
                buildTsConfigPaths.add((0, devkit_1.joinPathFragments)(target.options.tsConfig));
            }
            if (target.configurations) {
                for (const [configurationName, configuration] of Object.entries(target.configurations)) {
                    configurationOptions[configurationName] = {};
                    handleBuildTargetOptions(tree, configuration, configurationOptions[configurationName], project.root);
                    if (configuration.tsConfig) {
                        buildTsConfigPaths.add((0, devkit_1.joinPathFragments)(configuration.tsConfig));
                    }
                }
            }
            buildTarget = { name: targetName, config: target };
            targetsToRemove.push(targetName);
        }
        else if (target.executor === '@angular-devkit/build-angular:server' ||
            target.executor === '@nx/angular:webpack-server') {
            createConfigOptions.ssr ??= {};
            createConfigOptions.ssr.entry ??= normalizeFromProjectRoot(tree, target.options.main, project.root);
            createConfigOptions.server = './src/main.server.ts';
            serverTsConfigPath = target.options?.tsConfig
                ? // each target can spell the same path differently
                    (0, devkit_1.joinPathFragments)(target.options.tsConfig)
                : undefined;
            targetsToRemove.push(targetName);
        }
        else if (target.executor === '@angular-devkit/build-angular:dev-server' ||
            target.executor === '@nx/angular:dev-server') {
            createConfigOptions.devServer = {};
            if (target.options) {
                handleDevServerTargetOptions(tree, target.options, createConfigOptions.devServer, project.root);
                if (target.options.port && target.options.port !== DEFAULT_PORT) {
                    projectServePort = target.options.port;
                }
            }
            if (target.configurations) {
                for (const [configurationName, configuration] of Object.entries(target.configurations)) {
                    configurationOptions[configurationName] ??= {};
                    configurationOptions[configurationName].devServer ??= {};
                    handleDevServerTargetOptions(tree, configuration, configurationOptions[configurationName].devServer, project.root);
                    if (configuration.port && configuration.port !== DEFAULT_PORT) {
                        projectServeConfigurationOptions[configurationName] ??= {};
                        projectServeConfigurationOptions[configurationName].port =
                            configuration.port;
                    }
                }
            }
            serveTarget = { name: targetName, config: target };
            targetsToRemove.push(targetName);
        }
        else if (target.executor === '@angular-devkit/build-angular:prerender') {
            if (target.options) {
                const prerenderOptions = {
                    routesFile: target.options.routesFile,
                    discoverRoutes: target.options.discoverRoutes ?? true,
                    routes: target.options.routes ?? [],
                };
                createConfigOptions.prerender = prerenderOptions;
                if (target.configurations) {
                    for (const [configurationName, configuration] of Object.entries(target.configurations)) {
                        configurationOptions[configurationName] ??= {};
                        configurationOptions[configurationName].prerender ??= {
                            routesFile: configuration.routesFile,
                            discoverRoutes: configuration.discoverRoutes ?? true,
                            routes: configuration.routes ?? [],
                        };
                    }
                }
            }
            targetsToRemove.push(targetName);
        }
        else if (target.executor === '@angular-devkit/build-angular:app-shell') {
            createConfigOptions.appShell = true;
            targetsToRemove.push(targetName);
        }
    }
    if (createConfigOptions.ssr && (0, version_utils_1.supportsSsrAllowedHosts)(tree)) {
        // The engine matches the request host against this list and an unset list
        // matches nothing, so surface it for the deployment to fill in. Serving
        // seeds its own hosts and does not read it.
        createConfigOptions.security ??= {};
        createConfigOptions.security.allowedHosts ??= [];
    }
    const customWebpackConfigInfo = customWebpackConfigPath
        ? await (0, get_custom_webpack_config_1.getCustomWebpackConfig)(tree, project.root, customWebpackConfigPath)
        : undefined;
    (0, create_config_1.createConfig)(tree, createConfigOptions, configurationOptions, customWebpackConfigInfo?.normalizedPathToCustomWebpackConfig, customWebpackConfigInfo?.isWebpackConfigFunction);
    (0, update_tsconfig_1.updateTsconfig)(tree, project.root);
    if (serverTsConfigPath) {
        (0, merge_server_tsconfig_1.mergeServerTsConfig)(tree, project.root, serverTsConfigPath, buildTsConfigPaths);
    }
    for (const targetName of targetsToRemove) {
        delete project.targets[targetName];
    }
    (0, devkit_1.updateProjectConfiguration)(tree, projectName, project);
    // ensure plugin is registered
    const { rspackInitGenerator } = (0, devkit_1.ensurePackage)('@nx/rspack', versions_1.nxVersion);
    await rspackInitGenerator(tree, {
        framework: 'angular',
    });
    // find the inferred target names
    const nxJson = (0, devkit_1.readNxJson)(tree);
    let inferredBuildTargetName = 'build';
    let inferredServeTargetName = 'serve';
    const pluginRegistration = nxJson.plugins.find((p) => typeof p === 'string' ? false : p.plugin === '@nx/rspack/plugin');
    if (pluginRegistration) {
        inferredBuildTargetName =
            pluginRegistration.options.buildTargetName ?? inferredBuildTargetName;
        inferredServeTargetName =
            pluginRegistration.options.serveTargetName ?? inferredServeTargetName;
    }
    if (buildTarget) {
        // these are all replaced by the inferred task
        delete buildTarget.config.options;
        delete buildTarget.config.configurations;
        delete buildTarget.config.defaultConfiguration;
        delete buildTarget.config.executor;
        const shouldOverrideInputs = (inputs) => {
            if (!inputs?.length) {
                return false;
            }
            if (inputs.length === 2) {
                // check whether the existing inputs would match the inferred task
                // inputs with the exception of the @rspack/cli external dependency
                // which webpack tasks wouldn't have
                const namedInputs = (0, internal_1.getNamedInputs)(project.root, {
                    nxJsonConfiguration: nxJson,
                    workspaceRoot: devkit_1.workspaceRoot,
                });
                if ('production' in namedInputs) {
                    return !['production', '^production'].every((input) => inputs.includes(input));
                }
                return !['default', '^default'].every((input) => inputs.includes(input));
            }
            return true;
        };
        if (shouldOverrideInputs(buildTarget.config.inputs)) {
            // keep existing inputs and add the @rspack/cli external dependency
            buildTarget.config.inputs = [
                ...buildTarget.config.inputs,
                { externalDependencies: ['@rspack/cli'] },
            ];
        }
        else {
            delete buildTarget.config.inputs;
        }
        if (buildTarget.config.cache) {
            delete buildTarget.config.cache;
        }
        if (buildTarget.config.dependsOn?.length === 1 &&
            buildTarget.config.dependsOn[0] === `^${buildTarget.name}`) {
            delete buildTarget.config.dependsOn;
        }
        else if (buildTarget.config.dependsOn) {
            buildTarget.config.dependsOn = buildTarget.config.dependsOn.map((dep) => dep === `^${buildTarget.name}` ? `^${inferredBuildTargetName}` : dep);
        }
        const newOutputPath = (0, devkit_1.joinPathFragments)(project.root, createConfigOptions.outputPath.base);
        const shouldOverrideOutputs = (outputs) => {
            if (!outputs?.length) {
                // this means the target was wrongly configured, so, we don't override
                // anything and let the inferred outputs be used
                return false;
            }
            if (outputs.length === 1) {
                if (outputs[0] === '{options.outputPath}') {
                    // the inferred task output is created after the createConfig
                    // outputPath option, so we don't need to keep this
                    return false;
                }
                const normalizedOutputPath = outputs[0]
                    .replace('{workspaceRoot}/', '')
                    .replace('{projectRoot}', project.root)
                    .replace('{projectName}', '');
                if (normalizedOutputPath === newOutputPath ||
                    normalizedOutputPath.replace(/\/browser\/?$/, '') === newOutputPath) {
                    return false;
                }
            }
            return true;
        };
        const normalizeOutput = (path, workspaceRoot, projectRoot) => {
            const fullProjectRoot = (0, path_1.resolve)(workspaceRoot, projectRoot);
            const fullPath = (0, path_1.resolve)(workspaceRoot, path);
            const pathRelativeToProjectRoot = (0, devkit_1.normalizePath)((0, path_1.relative)(fullProjectRoot, fullPath));
            if (pathRelativeToProjectRoot.startsWith('..')) {
                return (0, devkit_1.joinPathFragments)('{workspaceRoot}', (0, path_1.relative)(workspaceRoot, fullPath));
            }
            return (0, devkit_1.joinPathFragments)('{projectRoot}', pathRelativeToProjectRoot);
        };
        if (shouldOverrideOutputs(buildTarget.config.outputs)) {
            buildTarget.config.outputs = buildTarget.config.outputs.map((output) => {
                if (output === '{options.outputPath}') {
                    // the target won't have an outputPath option, so we replace it with the new output path
                    return normalizeOutput(newOutputPath, devkit_1.workspaceRoot, project.root);
                }
                const normalizedOutputPath = output
                    .replace('{workspaceRoot}/', '')
                    .replace('{projectRoot}', project.root)
                    .replace('{projectName}', '');
                if (/\/browser\/?$/.test(normalizedOutputPath) &&
                    normalizedOutputPath.replace(/\/browser\/?$/, '') === newOutputPath) {
                    return normalizeOutput(newOutputPath, devkit_1.workspaceRoot, project.root);
                }
                return output;
            });
        }
        else {
            delete buildTarget.config.outputs;
        }
        if (buildTarget.config.syncGenerators?.length === 1 &&
            buildTarget.config.syncGenerators[0] === '@nx/js:typescript-sync') {
            delete buildTarget.config.syncGenerators;
        }
        else if (buildTarget.config.syncGenerators?.length) {
            buildTarget.config.syncGenerators = Array.from(new Set([
                ...buildTarget.config.syncGenerators,
                '@nx/js:typescript-sync',
            ]));
        }
        if (Object.keys(buildTarget.config).length) {
            // there's extra target metadata left that wouldn't be inferred, we keep it
            project.targets[inferredBuildTargetName] = buildTarget.config;
        }
    }
    if (serveTarget) {
        delete serveTarget.config.options;
        delete serveTarget.config.configurations;
        delete serveTarget.config.defaultConfiguration;
        delete serveTarget.config.executor;
        if (serveTarget.config.continuous) {
            delete serveTarget.config.continuous;
        }
        // Nx writes it for the dev server builders, and it would override the
        // readyWhen inferred for the Rspack serve target
        if ((0, node_util_1.isDeepStrictEqual)(serveTarget.config.readyWhen, { signal: true })) {
            delete serveTarget.config.readyWhen;
        }
        if (serveTarget.config.syncGenerators?.length === 1 &&
            serveTarget.config.syncGenerators[0] === '@nx/js:typescript-sync') {
            delete serveTarget.config.syncGenerators;
        }
        else if (serveTarget.config.syncGenerators?.length) {
            serveTarget.config.syncGenerators = Array.from(new Set([
                ...serveTarget.config.syncGenerators,
                '@nx/js:typescript-sync',
            ]));
        }
        if (projectServePort !== DEFAULT_PORT) {
            serveTarget.config.options = {};
            serveTarget.config.options.port = projectServePort;
        }
        if (Object.keys(projectServeConfigurationOptions).length > 0) {
            serveTarget.config.configurations = {};
            for (const [configurationName, options] of Object.entries(projectServeConfigurationOptions)) {
                serveTarget.config.configurations[configurationName] = options;
            }
        }
        if (Object.keys(serveTarget.config).length) {
            // there's extra target metadata left that wouldn't be inferred, we keep it
            project.targets[inferredServeTargetName] = serveTarget.config;
        }
    }
    (0, devkit_1.updateProjectConfiguration)(tree, projectName, project);
    // This is needed to prevent a circular execution of the build target
    const rootPkgJson = (0, devkit_1.readJson)(tree, 'package.json');
    if (rootPkgJson.scripts?.build === 'nx build') {
        delete rootPkgJson.scripts.build;
        (0, devkit_1.writeJson)(tree, 'package.json', rootPkgJson);
    }
    if (!schema.skipInstall) {
        const { webpackMergeVersion, tsNodeVersion } = (0, version_utils_1.versions)(tree);
        (0, acknowledge_build_scripts_1.acknowledgeAngularBuildScripts)(tree);
        // @nx/angular-rspack-compiler's install script patches `@angular/build`
        // versions below 20.2.0, so it has to run. core-js only prints a funding
        // message.
        (0, internal_1.acknowledgeBuildScripts)(tree, (0, devkit_1.detectPackageManager)(tree.root), {
            '@nx/angular-rspack-compiler': true,
            'core-js': false,
        });
        const installTask = (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
            '@nx/angular-rspack': versions_1.nxVersion,
            'webpack-merge': webpackMergeVersion,
            'ts-node': tsNodeVersion,
        });
        tasks.push(installTask);
    }
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = convertToRspack;
