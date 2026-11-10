"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeWebpackBrowserBuilder = executeWebpackBrowserBuilder;
const devkit_1 = require("@nx/devkit");
const fs_1 = require("fs");
const path_1 = require("path");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const builder_package_1 = require("../../executors/utilities/builder-package");
const buildable_libs_1 = require("../utilities/buildable-libs");
const internal_1 = require("@nx/devkit/internal");
// This is required to ensure that the webpack version used by the Module Federation is the same as the one used by the builders.
const Module = require('module');
const originalResolveFilename = Module._resolveFilename;
const patchedWebpackPath = require.resolve('webpack', {
    paths: [require.resolve('@angular-devkit/build-angular')],
});
// Override the resolve function
Module._resolveFilename = function (request, parent, isMain, options) {
    // Intercept webpack specifically
    if (request === 'webpack') {
        // Force webpack to resolve from your specific path
        return patchedWebpackPath;
    }
    // For all other modules, use the original resolver
    return originalResolveFilename.call(this, request, parent, isMain, options);
};
function shouldSkipInitialTargetRun(projectGraph, project, target) {
    const allTargetNames = new Set();
    for (const projectName in projectGraph.nodes) {
        const project = projectGraph.nodes[projectName];
        for (const targetName in project.data.targets ?? {}) {
            allTargetNames.add(targetName);
        }
    }
    const projectDependencyConfigs = (0, internal_1.getDependencyConfigs)({ project, target }, {}, projectGraph, Array.from(allTargetNames));
    // if the task runner already ran the target, skip the initial run
    return projectDependencyConfigs.some((d) => d.target === target && d.projects === 'dependencies');
}
function executeWebpackBrowserBuilder(options, context) {
    (0, builder_package_1.assertPackageIsInstalled)('@nx/webpack', '@nx/angular:webpack-browser');
    options.buildLibsFromSource ??= true;
    options.watchDependencies ??= true;
    const { buildLibsFromSource, customWebpackConfig, indexHtmlTransformer, watchDependencies, ...delegateBuilderOptions } = options;
    process.env.NX_BUILD_LIBS_FROM_SOURCE = `${buildLibsFromSource}`;
    process.env.NX_BUILD_TARGET = (0, devkit_1.targetToTargetString)({ ...context.target });
    const pathToWebpackConfig = customWebpackConfig?.path &&
        (0, devkit_1.joinPathFragments)(context.workspaceRoot, customWebpackConfig.path);
    if (pathToWebpackConfig && !(0, fs_1.existsSync)(pathToWebpackConfig)) {
        throw new Error(`Custom Webpack Config File Not Found!\nTo use a custom webpack config, please ensure the path to the custom webpack file is correct: \n${pathToWebpackConfig}`);
    }
    const pathToIndexFileTransformer = indexHtmlTransformer &&
        (0, devkit_1.joinPathFragments)(context.workspaceRoot, indexHtmlTransformer);
    if (pathToIndexFileTransformer && !(0, fs_1.existsSync)(pathToIndexFileTransformer)) {
        throw new Error(`File containing Index File Transformer function Not Found!\n Please ensure the path to the file containing the function is correct: \n${pathToIndexFileTransformer}`);
    }
    let dependencies;
    let projectGraph;
    if (!buildLibsFromSource) {
        projectGraph = (0, devkit_1.readCachedProjectGraph)();
        const { tsConfigPath, dependencies: foundDependencies } = (0, buildable_libs_1.createTmpTsConfigForBuildableLibs)(delegateBuilderOptions.tsConfig, context, { projectGraph });
        dependencies = foundDependencies;
        delegateBuilderOptions.tsConfig = (0, devkit_1.normalizePath)((0, path_1.relative)(context.workspaceRoot, tsConfigPath));
    }
    (0, builder_package_1.assertPackageIsInstalled)('@angular-devkit/build-angular', '@nx/angular:webpack-browser');
    (0, builder_package_1.assertPackageIsInstalled)('webpack-merge', '@nx/angular:webpack-browser');
    return (0, rxjs_1.from)(Promise.all([
        import('@angular-devkit/build-angular'),
        import('@nx/webpack/internal'),
        import('../utilities/webpack.js'),
    ])).pipe((0, operators_1.switchMap)(([{ executeBrowserBuilder }, { WebpackNxBuildCoordinationPlugin }, { mergeCustomWebpackConfig, resolveIndexHtmlTransformer },]) => executeBrowserBuilder(delegateBuilderOptions, context, {
        webpackConfiguration: (baseWebpackConfig) => {
            if (!buildLibsFromSource && delegateBuilderOptions.watch) {
                const workspaceDependencies = dependencies
                    .filter((dep) => !(0, internal_1.isNpmProject)(dep.node))
                    .map((dep) => dep.node.name);
                // default for `nx run-many` is --all projects
                // by passing an empty string for --projects, run-many will default to
                // run the target for all projects.
                // This will occur when workspaceDependencies = []
                if (workspaceDependencies.length > 0) {
                    const skipInitialRun = shouldSkipInitialTargetRun(projectGraph, context.target.project, context.target.target);
                    baseWebpackConfig.plugins.push(
                    // Cast away the angular/webpack plugin type difference (webpack versions).
                    new WebpackNxBuildCoordinationPlugin(`nx run-many --target=${context.target.target} --projects=${workspaceDependencies.join(',')}`, { skipInitialRun, skipWatchingDeps: !watchDependencies }));
                }
            }
            if (!pathToWebpackConfig) {
                return baseWebpackConfig;
            }
            return mergeCustomWebpackConfig(baseWebpackConfig, pathToWebpackConfig, delegateBuilderOptions, context.target);
        },
        ...(pathToIndexFileTransformer
            ? {
                indexHtml: resolveIndexHtmlTransformer(pathToIndexFileTransformer, delegateBuilderOptions.tsConfig, context.target),
            }
            : {}),
    })));
}
exports.default = require('@angular-devkit/architect').createBuilder(executeWebpackBrowserBuilder);
