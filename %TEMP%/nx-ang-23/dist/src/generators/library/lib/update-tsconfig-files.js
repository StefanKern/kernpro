"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTsConfigFiles = updateTsConfigFiles;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const internal_1 = require("@nx/js/internal");
const tsconfig_utils_1 = require("../../utils/tsconfig-utils");
const update_project_root_tsconfig_1 = require("../../utils/update-project-root-tsconfig");
const version_utils_1 = require("../../utils/version-utils");
function updateTsConfigFiles(tree, options) {
    (0, js_1.extractTsConfigBase)(tree);
    updateProjectConfig(tree, options);
    updateProjectIvyConfig(tree, options);
    // Only add tsconfig path mapping if skipTsConfig is not true
    if (!options.skipTsConfig) {
        (0, js_1.addTsConfigPath)(tree, options.importPath, [
            (0, devkit_1.joinPathFragments)(options.projectRoot, './src', 'index.ts'),
        ]);
    }
    const compilerOptions = {
        skipLibCheck: true,
        experimentalDecorators: true,
        importHelpers: true,
        isolatedModules: true,
        target: 'es2022',
        moduleResolution: 'bundler',
        ...(options.strict
            ? {
                strict: true,
                noImplicitOverride: true,
                noPropertyAccessFromIndexSignature: true,
                noImplicitReturns: true,
                noFallthroughCasesInSwitch: true,
            }
            : {}),
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
    const tsconfigPath = (0, devkit_1.joinPathFragments)(options.projectRoot, 'tsconfig.json');
    (0, devkit_1.updateJson)(tree, tsconfigPath, (json) => {
        json.compilerOptions = {
            ...json.compilerOptions,
            ...compilerOptions,
        };
        json.compilerOptions = (0, internal_1.getNeededCompilerOptionOverrides)(tree, json.compilerOptions, rootTsConfigPath);
        if (options.strict) {
            json.angularCompilerOptions = {
                ...json.angularCompilerOptions,
                strictInjectionParameters: true,
                strictInputAccessModifiers: true,
                typeCheckHostBindings: angularMajorVersion === 20 ? true : undefined,
                strictTemplates: true,
            };
        }
        return json;
    });
    if (options.unitTestRunner === 'jest') {
        const tsconfigSpecPath = (0, devkit_1.joinPathFragments)(options.projectRoot, 'tsconfig.spec.json');
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
function updateProjectConfig(host, options) {
    (0, devkit_1.updateJson)(host, `${options.projectRoot}/tsconfig.lib.json`, (json) => {
        json.include = ['src/**/*.ts'];
        json.exclude = [
            ...new Set([
                ...(json.exclude || []),
                'src/**/*.spec.ts',
                'src/**/*.test.ts',
            ]),
        ];
        return json;
    });
    // tsconfig.json
    (0, update_project_root_tsconfig_1.updateProjectRootTsConfig)(host, options.projectRoot, (0, js_1.getRelativePathToRootTsConfig)(host, options.projectRoot));
}
function updateProjectIvyConfig(host, options) {
    if (options.buildable || options.publishable) {
        return (0, devkit_1.updateJson)(host, `${options.projectRoot}/tsconfig.lib.prod.json`, (json) => {
            json.angularCompilerOptions['compilationMode'] =
                options.compilationMode === 'full' ? undefined : 'partial';
            return json;
        });
    }
}
