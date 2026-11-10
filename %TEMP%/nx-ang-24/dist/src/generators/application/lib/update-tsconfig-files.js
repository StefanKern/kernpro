"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTsconfigFiles = updateTsconfigFiles;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const internal_1 = require("@nx/js/internal");
const tsconfig_utils_1 = require("../../utils/tsconfig-utils");
const version_utils_1 = require("../../utils/version-utils");
const enable_strict_type_checking_1 = require("./enable-strict-type-checking");
function updateTsconfigFiles(tree, options) {
    (0, enable_strict_type_checking_1.enableStrictTypeChecking)(tree, options);
    const compilerOptions = {
        skipLibCheck: true,
        experimentalDecorators: true,
        importHelpers: true,
        isolatedModules: true,
        target: 'es2022',
        moduleResolution: 'bundler',
    };
    const rootTsConfigPath = (0, js_1.getRootTsConfigFileName)(tree);
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    // Angular warns about emitDecoratorMetadata when isolatedModules is enabled,
    // so disable it if it's set in the root tsconfig.
    if ((0, tsconfig_utils_1.getDefinedCompilerOption)(tree, rootTsConfigPath, 'emitDecoratorMetadata') === true) {
        compilerOptions.emitDecoratorMetadata = false;
    }
    if (angularMajorVersion >= 21) {
        compilerOptions.moduleResolution = 'bundler';
    }
    compilerOptions.module = 'preserve';
    const tsconfigPath = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.json');
    (0, devkit_1.updateJson)(tree, tsconfigPath, (json) => {
        json.compilerOptions = {
            ...json.compilerOptions,
            ...compilerOptions,
        };
        // For standalone projects, rootTsConfigPath and tsconfigPath are the same
        // file. Calling getNeededCompilerOptionOverrides would compare the file
        // against itself and strip options like skipLibCheck that are already set.
        if (tsconfigPath !== rootTsConfigPath) {
            json.compilerOptions = (0, internal_1.getNeededCompilerOptionOverrides)(tree, json.compilerOptions, rootTsConfigPath);
        }
        return json;
    });
    if (options.unitTestRunner === 'jest') {
        const tsconfigSpecPath = (0, devkit_1.joinPathFragments)(options.appProjectRoot, 'tsconfig.spec.json');
        (0, devkit_1.updateJson)(tree, tsconfigSpecPath, (json) => {
            json.compilerOptions = {
                ...json.compilerOptions,
                module: 'commonjs',
                moduleResolution: 'node10',
            };
            json.compilerOptions = (0, internal_1.getNeededCompilerOptionOverrides)(tree, json.compilerOptions, tsconfigPath);
            return json;
        });
    }
}
