"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = unitTestExecutor;
const ngcli_adapter_1 = require("@nx/devkit/ngcli-adapter");
const targets_1 = require("../../utils/targets");
const semver_1 = require("semver");
const angular_version_utils_1 = require("../utilities/angular-version-utils");
const builder_package_1 = require("../utilities/builder-package");
const esbuild_extensions_1 = require("../utilities/esbuild-extensions");
async function* unitTestExecutor(options, context) {
    validateOptions(options);
    const { plugins: pluginPaths, indexHtmlTransformer: indexHtmlTransformerPath, ...delegateExecutorOptions } = options;
    const plugins = await (0, esbuild_extensions_1.loadPlugins)(pluginPaths, options.tsConfig);
    const indexHtmlTransformer = indexHtmlTransformerPath
        ? await (0, esbuild_extensions_1.loadIndexHtmlTransformer)(indexHtmlTransformerPath, options.tsConfig)
        : undefined;
    const builderContext = await (0, ngcli_adapter_1.createBuilderContext)({
        builderName: '@nx/angular:unit-test',
        description: 'Run application unit tests.',
        optionSchema: require('./schema.json'),
    }, context);
    const buildTargetSpecifier = options.buildTarget ?? `::development`;
    const buildTarget = (0, targets_1.targetFromTargetString)(buildTargetSpecifier, context.projectName, 'build');
    patchBuilderContext(builderContext, buildTarget);
    (0, builder_package_1.assertPackageIsInstalled)('@angular/build', '@nx/angular:unit-test');
    const { executeUnitTestBuilder } = await import('@angular/build');
    return yield* executeUnitTestBuilder(delegateExecutorOptions, builderContext, {
        codePlugins: plugins,
        indexHtmlTransformer,
    });
}
function validateOptions(options) {
    const { version: angularVersion, major: angularMajorVersion } = (0, angular_version_utils_1.getInstalledAngularVersionInfo)();
    if (angularMajorVersion < 21) {
        throw new Error(`The "unit-test" executor is only available for Angular versions >= 21.0.0. You are currently using version ${angularVersion}.`);
    }
    if ((0, semver_1.lt)(angularVersion, '21.2.0')) {
        if (options.headless !== undefined) {
            throw new Error(`The "headless" option requires Angular version 21.2.0 or greater. You are currently using version ${angularVersion}.`);
        }
    }
    if ((0, semver_1.lt)(angularVersion, '22.0.0')) {
        if (options.isolate !== undefined) {
            throw new Error(`The "isolate" option requires Angular version 22.0.0 or greater. You are currently using version ${angularVersion}.`);
        }
        if (options.quiet !== undefined) {
            throw new Error(`The "quiet" option requires Angular version 22.0.0 or greater. You are currently using version ${angularVersion}.`);
        }
    }
    if ((0, semver_1.lt)(angularVersion, '22.2.0')) {
        if (options.splitting !== undefined) {
            throw new Error(`The "splitting" option requires Angular version 22.2.0 or greater. You are currently using version ${angularVersion}.`);
        }
    }
}
/**
 * The Angular CLI unit-test builder only accepts the `@angular/build:application`
 * and `@angular/build:ng-packagr` builders. We need to patch the builder context
 * so that it accepts the `@nx/angular:*` executors.
 *
 * https://github.com/angular/angular-cli/blob/f9de11d67d3e0e0524372819583bc77756596d4f/packages/angular/build/src/builders/unit-test/builder.ts#L246-L262
 */
function patchBuilderContext(context, buildTarget) {
    const executorToBuilderMap = new Map([
        ['@nx/angular:application', '@angular/build:application'],
        ['@nx/angular:ng-packagr-lite', '@angular/build:ng-packagr'],
        ['@nx/angular:package', '@angular/build:ng-packagr'],
    ]);
    const originalGetBuilderNameForTarget = context.getBuilderNameForTarget;
    context.getBuilderNameForTarget = async (target) => {
        const builderName = await originalGetBuilderNameForTarget(target);
        if (executorToBuilderMap.has(builderName)) {
            return executorToBuilderMap.get(builderName);
        }
        return builderName;
    };
    const originalGetTargetOptions = context.getTargetOptions;
    context.getTargetOptions = async (target) => {
        const options = await originalGetTargetOptions(target);
        if (target.project === buildTarget.project &&
            target.target === buildTarget.target &&
            target.configuration === buildTarget.configuration) {
            cleanBuildTargetOptions(options);
        }
        return options;
    };
}
function cleanBuildTargetOptions(options) {
    if ('buildLibsFromSource' in options ||
        'indexHtmlTransformer' in options ||
        'plugins' in options) {
        delete options.buildLibsFromSource;
        delete options.indexHtmlTransformer;
        delete options.plugins;
    }
    return options;
}
