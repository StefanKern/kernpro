"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = addOptionalWebpackPackages;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const versions_1 = require("../../utils/versions");
const webpackExecutors = new Set([
    '@nx/angular:webpack-browser',
    '@nx/angular:webpack-server',
]);
const webpackBuildTargetExecutors = new Set([
    '@nx/angular:webpack-browser',
    '@angular-devkit/build-angular:browser',
]);
const moduleFederationExecutors = new Set([
    '@nx/angular:module-federation-dev-server',
    '@nx/angular:module-federation-dev-ssr',
]);
function resolveBuildTargetExecutor(targetString, projects, targetDefaults) {
    const [projectName, targetName] = targetString.split(':');
    const target = targetName
        ? projects.get(projectName)?.targets?.[targetName]
        : undefined;
    if (target === undefined) {
        return undefined;
    }
    // The referenced build target can inherit its executor from targetDefaults,
    // which the raw project config does not merge, so resolve it before matching.
    return (target.executor ??
        (0, internal_1.readTargetDefaultsForTarget)(targetName, targetDefaults)?.executor);
}
function usesWebpackDevServer(target, projects, targetDefaults) {
    if (target.executor !== '@nx/angular:dev-server') {
        return false;
    }
    return [target.options, ...Object.values(target.configurations ?? {})].some((options) => {
        const buildTarget = options?.buildTarget ?? options?.browserTarget;
        if (typeof buildTarget !== 'string') {
            return false;
        }
        const executor = resolveBuildTargetExecutor(buildTarget, projects, targetDefaults);
        return (executor !== undefined && webpackBuildTargetExecutors.has(executor));
    });
}
async function addOptionalWebpackPackages(tree) {
    const projects = (0, devkit_1.getProjects)(tree);
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const targetDefaults = nxJson?.targetDefaults;
    let needsWebpack = false;
    let needsModuleFederation = false;
    let needsRspack = false;
    for (const [, project] of projects) {
        for (const target of Object.values(project.targets ?? {})) {
            needsWebpack ||=
                webpackExecutors.has(target.executor) ||
                    usesWebpackDevServer(target, projects, targetDefaults);
            needsModuleFederation ||= moduleFederationExecutors.has(target.executor);
            needsRspack ||= target.executor?.startsWith('@nx/rspack:') ?? false;
        }
        // Remotes get a plain dev-server (no Module Federation executor) but still
        // generate a module-federation.config that requires @nx/module-federation
        // at build time, so detect them by that config file too. This covers
        // remotes whose host lives in a different workspace.
        needsModuleFederation ||=
            tree.exists((0, devkit_1.joinPathFragments)(project.root, 'module-federation.config.ts')) ||
                tree.exists((0, devkit_1.joinPathFragments)(project.root, 'module-federation.config.js'));
    }
    // targetDefaults are keyed by target name or executor, and a default can set
    // an executor that an empty project target inherits, so scan the keys and any
    // executor on the default (both the object and array forms).
    for (const [targetOrExecutor, config] of Object.entries(targetDefaults ?? {})) {
        const executors = [targetOrExecutor];
        for (const entry of Array.isArray(config) ? config : [config]) {
            if (entry.executor != null) {
                executors.push(entry.executor);
            }
        }
        for (const executor of executors) {
            needsWebpack ||= webpackExecutors.has(executor);
            needsModuleFederation ||= moduleFederationExecutors.has(executor);
            needsRspack ||= executor.startsWith('@nx/rspack:');
        }
    }
    needsRspack ||=
        nxJson?.plugins?.some((plugin) => typeof plugin === 'string'
            ? plugin === '@nx/rspack/plugin'
            : plugin.plugin === '@nx/rspack/plugin') ?? false;
    if (!needsWebpack && !needsModuleFederation && !needsRspack) {
        return;
    }
    if (needsWebpack || needsRspack) {
        // @nx/webpack and @nx/rspack depend on sass, which pulls in
        // @parcel/watcher. Its install script only builds from source when
        // npm_config_build_from_source is set, so skip it.
        (0, internal_1.acknowledgeBuildScripts)(tree, (0, devkit_1.detectPackageManager)(tree.root), {
            '@parcel/watcher': false,
        });
    }
    return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
        ...(needsWebpack
            ? {
                '@nx/webpack': versions_1.nxVersion,
                'webpack-merge': versions_1.webpackMergeVersion,
            }
            : {}),
        ...(needsModuleFederation ? { '@nx/module-federation': versions_1.nxVersion } : {}),
        ...(needsRspack ? { '@nx/rspack': versions_1.nxVersion } : {}),
    }, undefined, true);
}
