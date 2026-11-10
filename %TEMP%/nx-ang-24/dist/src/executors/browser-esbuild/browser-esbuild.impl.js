"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = esbuildExecutor;
const buildable_libs_1 = require("../utilities/buildable-libs");
const esbuild_extensions_1 = require("../utilities/esbuild-extensions");
const ngcli_adapter_1 = require("@nx/devkit/ngcli-adapter");
async function* esbuildExecutor(options, context) {
    options.buildLibsFromSource ??= true;
    const { buildLibsFromSource, plugins: pluginPaths, ...delegateExecutorOptions } = options;
    let dependencies;
    if (!buildLibsFromSource) {
        const { tsConfigPath, dependencies: foundDependencies } = (0, buildable_libs_1.createTmpTsConfigForBuildableLibs)(delegateExecutorOptions.tsConfig, context);
        dependencies = foundDependencies;
        delegateExecutorOptions.tsConfig = tsConfigPath;
    }
    const plugins = await (0, esbuild_extensions_1.loadPlugins)(pluginPaths, options.tsConfig);
    const { buildEsbuildBrowser } = require('@angular-devkit/build-angular/src/builders/browser-esbuild');
    const builderContext = await (0, ngcli_adapter_1.createBuilderContext)({
        builderName: '@nx/angular:browser-esbuild',
        description: 'Build a browser application',
        optionSchema: require('@angular-devkit/build-angular/src/builders/browser-esbuild/schema.json'),
    }, context);
    return yield* buildEsbuildBrowser(delegateExecutorOptions, builderContext, 
    /* infrastructureSettings */ undefined, plugins);
}
