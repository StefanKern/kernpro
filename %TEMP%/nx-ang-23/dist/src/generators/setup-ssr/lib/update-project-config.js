"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProjectConfigForApplicationBuilder = updateProjectConfigForApplicationBuilder;
exports.updateProjectConfigForBrowserBuilder = updateProjectConfigForBrowserBuilder;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/js/internal");
const version_utils_1 = require("../../utils/version-utils");
const constants_1 = require("./constants");
function updateProjectConfigForApplicationBuilder(tree, options) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const buildTarget = project.targets.build;
    let outputPath = buildTarget.options?.outputPath;
    if (outputPath &&
        typeof outputPath !== 'string' &&
        outputPath.browser === '') {
        const base = outputPath.base;
        devkit_1.logger.warn(`The output location of the browser build has been updated from "${base}" to "${(0, devkit_1.joinPathFragments)(base, constants_1.DEFAULT_BROWSER_DIR)}".
          You might need to adjust your deployment pipeline.`);
        if ((outputPath.media && outputPath.media !== constants_1.DEFAULT_MEDIA_DIR) ||
            (outputPath.server && outputPath.server !== constants_1.DEFAULT_SERVER_DIR)) {
            delete outputPath.browser;
        }
        else {
            outputPath = outputPath.base;
            if (buildTarget.outputs && buildTarget.outputs.length > 0) {
                buildTarget.outputs = buildTarget.outputs.map((output) => output === '{options.outputPath.base}'
                    ? '{options.outputPath}'
                    : output);
            }
        }
    }
    const sourceRoot = (0, internal_2.getProjectSourceRoot)(project, tree);
    buildTarget.options ??= {};
    buildTarget.options.outputPath = outputPath;
    buildTarget.options.server = (0, devkit_1.joinPathFragments)(sourceRoot, options.main);
    buildTarget.options.ssr = {
        entry: (0, devkit_1.joinPathFragments)(sourceRoot, options.serverFileName),
    };
    buildTarget.options.outputMode = 'server';
    if ((0, version_utils_1.supportsSsrAllowedHosts)(tree)) {
        // The engine matches the request host against this list and an unset list
        // matches nothing, so surface it for the deployment to fill in
        buildTarget.options.security ??= {};
        buildTarget.options.security.allowedHosts ??= [];
    }
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, project);
}
function updateProjectConfigForBrowserBuilder(tree, options) {
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    const buildTarget = projectConfig.targets.build;
    const baseOutputPath = buildTarget.options.outputPath;
    buildTarget.options.outputPath = (0, devkit_1.joinPathFragments)(baseOutputPath, 'browser');
    const buildConfigurations = projectConfig.targets.build.configurations;
    const configurations = {};
    if (buildConfigurations) {
        for (const [key, options] of Object.entries(buildConfigurations)) {
            configurations[key] = getServerOptions(options);
        }
    }
    const sourceRoot = (0, internal_2.getProjectSourceRoot)(projectConfig, tree);
    projectConfig.targets.server = {
        dependsOn: ['build'],
        executor: options.buildTargetExecutor.startsWith('@angular-devkit/build-angular:')
            ? '@angular-devkit/build-angular:server'
            : '@nx/angular:webpack-server',
        options: {
            outputPath: (0, devkit_1.joinPathFragments)(baseOutputPath, 'server'),
            main: (0, devkit_1.joinPathFragments)(sourceRoot, options.serverFileName),
            tsConfig: (0, devkit_1.joinPathFragments)(projectConfig.root, 'tsconfig.server.json'),
            ...(buildTarget.options ? getServerOptions(buildTarget.options) : {}),
        },
        configurations,
        defaultConfiguration: 'production',
    };
    projectConfig.targets['serve-ssr'] = {
        continuous: true,
        executor: '@angular-devkit/build-angular:ssr-dev-server',
        configurations: {
            development: {
                browserTarget: `${options.project}:build:development`,
                serverTarget: `${options.project}:server:development`,
            },
            production: {
                browserTarget: `${options.project}:build:production`,
                serverTarget: `${options.project}:server:production`,
            },
        },
        defaultConfiguration: 'development',
    };
    projectConfig.targets.prerender = {
        executor: '@angular-devkit/build-angular:prerender',
        options: {
            routes: ['/'],
        },
        configurations: {
            development: {
                browserTarget: `${options.project}:build:development`,
                serverTarget: `${options.project}:server:development`,
            },
            production: {
                browserTarget: `${options.project}:build:production`,
                serverTarget: `${options.project}:server:production`,
            },
        },
        defaultConfiguration: 'production',
    };
    (0, devkit_1.updateProjectConfiguration)(tree, options.project, projectConfig);
    const nxJson = (0, devkit_1.readNxJson)(tree) ?? {};
    if (nxJson.tasksRunnerOptions?.default?.options?.cacheableOperations &&
        !nxJson.tasksRunnerOptions.default.options.cacheableOperations.includes('server')) {
        nxJson.tasksRunnerOptions.default.options.cacheableOperations.push('server');
    }
    const existing = (0, internal_1.findTargetDefault)(nxJson.targetDefaults, {
        target: 'server',
    });
    if (!existing || existing.cache === undefined) {
        (0, internal_1.upsertTargetDefault)(tree, nxJson, { target: 'server', cache: true });
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
function getServerOptions(options = {}) {
    return {
        buildOptimizer: options?.buildOptimizer,
        outputHashing: options?.outputHashing === 'all'
            ? 'media'
            : options?.outputHashing,
        fileReplacements: options?.fileReplacements,
        optimization: options?.optimization === undefined ? undefined : !!options?.optimization,
        sourceMap: options?.sourceMap,
        stylePreprocessorOptions: options?.stylePreprocessorOptions,
        resourcesOutputPath: options?.resourcesOutputPath,
        deployUrl: options?.deployUrl,
        i18nMissingTranslation: options?.i18nMissingTranslation,
        preserveSymlinks: options?.preserveSymlinks,
        extractLicenses: options?.extractLicenses,
        inlineStyleLanguage: options?.inlineStyleLanguage,
        vendorChunk: options?.vendorChunk,
    };
}
