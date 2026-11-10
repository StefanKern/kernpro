"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moduleFederationSsrDevServerExecutor = moduleFederationSsrDevServerExecutor;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/web/internal");
const fs_1 = require("fs");
const path_1 = require("path");
const module_federation_1 = require("../../builders/utilities/module-federation");
const builder_package_1 = require("../utilities/builder-package");
const normalize_options_1 = require("./lib/normalize-options");
const start_dev_remotes_1 = require("./lib/start-dev-remotes");
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
async function* moduleFederationSsrDevServerExecutor(schema, context) {
    (0, builder_package_1.assertPackageIsInstalled)('@nx/module-federation', '@nx/angular:module-federation-dev-ssr');
    const { startRemoteIterators } = await import('@nx/module-federation/internal');
    (0, module_federation_deprecation_1.warnAngularMfDevSsrExecutorDeprecation)();
    const options = (0, normalize_options_1.normalizeOptions)(schema);
    (0, builder_package_1.assertPackageIsInstalled)('@angular-devkit/build-angular', '@nx/angular:module-federation-dev-ssr');
    const { executeSSRDevServerBuilder } = await import('@angular-devkit/build-angular');
    const currIter = (0, internal_1.eachValueFrom)(executeSSRDevServerBuilder(options, await (0, ngcli_adapter_1.createBuilderContext)({
        builderName: '@nx/angular:webpack-server',
        description: 'Build a ssr application',
        optionSchema: require('../../builders/webpack-server/schema.json'),
    }, context)));
    if (options.isInitialHost === false) {
        return yield* currIter;
    }
    const { projects: workspaceProjects } = (0, devkit_1.readProjectsConfigurationFromProjectGraph)(context.projectGraph);
    const project = workspaceProjects[context.projectName];
    let pathToManifestFile;
    if (options.pathToManifestFile) {
        const userPathToManifestFile = (0, path_1.join)(context.root, options.pathToManifestFile);
        if (!(0, fs_1.existsSync)(userPathToManifestFile)) {
            throw new Error(`The provided Module Federation manifest file path does not exist. Please check the file exists at "${userPathToManifestFile}".`);
        }
        else if ((0, path_1.extname)(options.pathToManifestFile) !== '.json') {
            throw new Error(`The Module Federation manifest file must be a JSON. Please ensure the file at ${userPathToManifestFile} is a JSON.`);
        }
        pathToManifestFile = userPathToManifestFile;
    }
    else {
        pathToManifestFile = (0, module_federation_1.getDynamicMfManifestFile)(project, context.root);
    }
    (0, module_federation_1.validateDevRemotes)({ devRemotes: options.devRemotes }, workspaceProjects);
    const { remotes, staticRemotesIter, devRemoteIters } = await startRemoteIterators(options, context, start_dev_remotes_1.startRemotes, pathToManifestFile, 'angular', true);
    const removeBaseUrlEmission = (iter) => (0, internal_1.mapAsyncIterable)(iter, (v) => ({
        ...v,
        baseUrl: undefined,
    }));
    const combined = (0, internal_1.combineAsyncIterables)(removeBaseUrlEmission(staticRemotesIter), ...(devRemoteIters ? devRemoteIters.map(removeBaseUrlEmission) : []), (0, internal_1.createAsyncIterable)(async ({ next, done }) => {
        if (!options.isInitialHost) {
            done();
            return;
        }
        if (remotes.remotePorts.length) {
            devkit_1.logger.info(`Nx All remotes started, server ready at http://localhost:${options.port}`);
            next({ success: true, baseUrl: `http://localhost:${options.port}` });
            done();
            return;
        }
        try {
            const portsToWaitFor = staticRemotesIter && options.staticRemotesPort
                ? [options.staticRemotesPort, ...remotes.remotePorts]
                : [...remotes.remotePorts];
            await Promise.all(portsToWaitFor.map((port) => (0, internal_2.waitForPortOpen)(port, {
                retries: 480,
                retryDelay: 2500,
                host: 'localhost',
            })));
            next({ success: true, baseUrl: `http://localhost:${options.port}` });
        }
        catch (error) {
            throw new Error(`Failed to start remotes. Check above for any errors.`, {
                cause: error,
            });
        }
        finally {
            done();
        }
    }));
    let refs = 2 + (devRemoteIters?.length ?? 0);
    for await (const result of combined) {
        if (result.success === false)
            throw new Error('Remotes failed to start');
        if (result.success)
            refs--;
        if (refs === 0)
            break;
    }
    return yield* currIter;
}
exports.default = moduleFederationSsrDevServerExecutor;
