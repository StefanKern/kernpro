"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = applicationExecutor;
const buildable_libs_1 = require("../utilities/buildable-libs");
const builder_package_1 = require("../utilities/builder-package");
const esbuild_extensions_1 = require("../utilities/esbuild-extensions");
const normalize_options_1 = require("./utils/normalize-options");
const validate_options_1 = require("./utils/validate-options");
const ngcli_adapter_1 = require("@nx/devkit/ngcli-adapter");
async function* applicationExecutor(options, context) {
    (0, validate_options_1.validateOptions)(options);
    const { buildLibsFromSource = true, plugins: pluginPaths, indexHtmlTransformer: indexHtmlTransformerPath, ...delegateExecutorOptions } = (0, normalize_options_1.normalizeOptions)(options);
    let dependencies;
    if (!buildLibsFromSource) {
        const { tsConfigPath, dependencies: foundDependencies } = (0, buildable_libs_1.createTmpTsConfigForBuildableLibs)(delegateExecutorOptions.tsConfig, context);
        dependencies = foundDependencies;
        delegateExecutorOptions.tsConfig = tsConfigPath;
    }
    const plugins = await (0, esbuild_extensions_1.loadPlugins)(pluginPaths, options.tsConfig);
    const indexHtmlTransformer = indexHtmlTransformerPath
        ? await (0, esbuild_extensions_1.loadIndexHtmlTransformer)(indexHtmlTransformerPath, options.tsConfig)
        : undefined;
    const builderContext = await (0, ngcli_adapter_1.createBuilderContext)({
        builderName: '@nx/angular:application',
        description: 'Build an application.',
        optionSchema: require('./schema.json'),
    }, context);
    (0, builder_package_1.assertPackageIsInstalled)('@angular/build', '@nx/angular:application');
    const { buildApplication } = await import('@angular/build');
    return yield* buildApplication(delegateExecutorOptions, builderContext, {
        codePlugins: plugins,
        indexHtmlTransformer,
    });
}
