"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngPackagrLiteExecutor = void 0;
const internal_1 = require("@nx/js/internal");
const path_1 = require("path");
const package_impl_1 = require("../package/package.impl");
const typescript_1 = require("../utilities/typescript");
const ng_packagr_1 = require("./ng-packagr-adjustments/ng-packagr");
async function initializeNgPackgrLite(options, context, projectDependencies) {
    const ngPackagr = await (0, ng_packagr_1.getNgPackagrInstance)();
    ngPackagr.forProject((0, path_1.resolve)(context.root, options.project));
    if (options.tsConfig) {
        const remappedTsConfigFilePath = (0, internal_1.createTmpTsConfig)((0, path_1.join)(context.root, options.tsConfig), context.root, context.projectsConfigurations.projects[context.projectName].root, projectDependencies);
        const tsConfig = await (0, typescript_1.parseRemappedTsConfigAndMergeDefaults)(context.root, options.tsConfig, remappedTsConfigFilePath);
        ngPackagr.withTsConfig(tsConfig);
    }
    return ngPackagr;
}
exports.ngPackagrLiteExecutor = (0, package_impl_1.createLibraryExecutor)(initializeNgPackgrLite);
exports.default = exports.ngPackagrLiteExecutor;
