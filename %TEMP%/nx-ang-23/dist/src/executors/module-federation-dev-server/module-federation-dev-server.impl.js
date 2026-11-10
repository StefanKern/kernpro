"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleFederationDevServerExecutor = moduleFederationDevServerExecutor;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const builder_package_1 = require("../utilities/builder-package");
const lib_1 = require("./lib");
const internal_2 = require("@nx/web/internal");
const dev_server_impl_1 = require("../../builders/dev-server/dev-server.impl");
const module_federation_1 = require("../../builders/utilities/module-federation");
const path_1 = require("path");
const fs_1 = require("fs");
const module_federation_deprecation_1 = require("../../utils/module-federation-deprecation");
const ngcli_adapter_1 = require("@nx/devkit/ngcli-adapter");
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
async function* moduleFederationDevServerExecutor(schema, context) {
    (0, builder_package_1.assertPackageIsInstalled)('@nx/module-federation', '@nx/angular:module-federation-dev-server');
    const { startRemoteIterators } = await import('@nx/module-federation/internal');
    (0, module_federation_deprecation_1.warnAngularMfDevServerExecutorDeprecation)();
    const options = (0, lib_1.normalizeOptions)(schema);
    const { projects: workspaceProjects } = (0, devkit_1.readProjectsConfigurationFromProjectGraph)(context.projectGraph);
    const project = workspaceProjects[context.projectName];
    const currIter = options.static
        ? (0, internal_2.fileServerExecutor)({
            port: options.port,
            host: options.host,
            ssl: options.ssl,
            buildTarget: options.buildTarget,
            parallel: false,
            spa: false,
            withDeps: false,
            cors: true,
            cacheSeconds: -1,
        }, context)
        : (0, internal_1.eachValueFrom)((0, dev_server_impl_1.executeDevServerBuilder)(options, await (0, ngcli_adapter_1.createBuilderContext)({
            builderName: '@nx/angular:webpack-browser',
            description: 'Build a browser application',
            optionSchema: require('../../builders/webpack-browser/schema.json'),
        }, context)));
    if (options.isInitialHost === false) {
        return yield* currIter;
    }
    let pathToManifestFile;
    if (!options.pathToManifestFile) {
        pathToManifestFile = (0, module_federation_1.getDynamicMfManifestFile)(project, context.root);
    }
    else {
        const userPathToManifestFile = (0, path_1.join)(context.root, options.pathToManifestFile);
        if (!(0, fs_1.existsSync)(userPathToManifestFile)) {
            throw new Error(`The provided Module Federation manifest file path does not exist. Please check the file exists at "${userPathToManifestFile}".`);
        }
        else if ((0, path_1.extname)(options.pathToManifestFile) !== '.json') {
            throw new Error(`The Module Federation manifest file must be a JSON. Please ensure the file at ${userPathToManifestFile} is a JSON.`);
        }
        pathToManifestFile = userPathToManifestFile;
    }
    (0, module_federation_1.validateDevRemotes)(options, workspaceProjects);
    const { remotes, staticRemotesIter, devRemoteIters } = await startRemoteIterators(options, context, lib_1.startRemotes, pathToManifestFile, 'angular');
    const removeBaseUrlEmission = (iter) => (0, internal_1.mapAsyncIterable)(iter, (v) => ({
        ...v,
        baseUrl: undefined,
    }));
    return yield* (0, internal_1.combineAsyncIterables)(removeBaseUrlEmission(currIter), ...devRemoteIters.map(removeBaseUrlEmission), ...(staticRemotesIter ? [removeBaseUrlEmission(staticRemotesIter)] : []), (0, internal_1.createAsyncIterable)(async ({ next, done }) => {
        if (!options.isInitialHost) {
            done();
            return;
        }
        if (remotes.remotePorts.length === 0) {
            devkit_1.logger.info(`NX All remotes started, server ready at http://localhost:${options.port}`);
            next({ success: true, baseUrl: `http://localhost:${options.port}` });
            done();
            return;
        }
        try {
            const portsToWaitFor = staticRemotesIter
                ? [options.staticRemotesPort, ...remotes.remotePorts]
                : [...remotes.remotePorts];
            await Promise.all(portsToWaitFor.map((port) => (0, internal_2.waitForPortOpen)(port, {
                retries: 480,
                retryDelay: 2500,
                host: 'localhost',
            })));
            devkit_1.logger.info(`NX All remotes started, server ready at http://localhost:${options.port}`);
            next({ success: true, baseUrl: `http://localhost:${options.port}` });
        }
        catch (err) {
            throw new Error(`Failed to start remotes. Check above for any errors.`, {
                cause: err,
            });
        }
        finally {
            done();
        }
    }));
}
exports.default = moduleFederationDevServerExecutor;
