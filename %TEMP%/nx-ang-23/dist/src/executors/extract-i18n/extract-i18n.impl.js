"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = extractI18nExecutor;
const devkit_1 = require("@nx/devkit");
const builder_package_1 = require("../utilities/builder-package");
const patch_builder_context_1 = require("../utilities/patch-builder-context");
const ngcli_adapter_1 = require("@nx/devkit/ngcli-adapter");
const internal_1 = require("@nx/devkit/internal");
async function* extractI18nExecutor(options, context) {
    const parsedBuildTarget = (0, devkit_1.parseTargetString)(options.buildTarget, context);
    const buildTargetProjectConfiguration = (0, internal_1.readCachedProjectConfiguration)(parsedBuildTarget.project);
    const buildTarget = buildTargetProjectConfiguration.targets[parsedBuildTarget.target];
    const isUsingEsbuildBuilder = [
        '@angular/build:application',
        '@angular-devkit/build-angular:application',
        '@angular-devkit/build-angular:browser-esbuild',
        '@nx/angular:application',
        '@nx/angular:browser-esbuild',
    ].includes(buildTarget.executor);
    const builderContext = await (0, ngcli_adapter_1.createBuilderContext)({
        builderName: '@nx/angular:extract-i18n',
        description: 'Extracts i18n messages from source code.',
        optionSchema: require('./schema.json'),
    }, context);
    /**
     * The Angular CLI extract-i18n builder make some decisions based on the build
     * target builder but it only considers `@angular-devkit/build-angular:*`
     * builders. Since we are using a custom builder, we patch the context to
     * handle `@nx/angular:*` executors.
     */
    (0, patch_builder_context_1.patchBuilderContext)(builderContext, isUsingEsbuildBuilder, parsedBuildTarget);
    (0, builder_package_1.assertPackageIsInstalled)('@angular-devkit/build-angular', '@nx/angular:extract-i18n');
    const { executeExtractI18nBuilder } = await import('@angular-devkit/build-angular');
    return await executeExtractI18nBuilder(options, builderContext);
}
