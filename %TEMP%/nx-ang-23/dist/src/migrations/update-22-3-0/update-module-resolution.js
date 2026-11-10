"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const tsconfig_utils_1 = require("../../generators/utils/tsconfig-utils");
const targets_1 = require("../../utils/targets");
const projects_1 = require("../utils/projects");
// Common tsconfig file names to account for non-buildable libraries
const KNOWN_TSCONFIG_FILES = [
    'tsconfig.json',
    'tsconfig.lib.json',
    'tsconfig.spec.json',
];
async function default_1(tree) {
    const uniqueTsConfigs = new Set();
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/core',
    ]);
    for (const graphNode of projects) {
        const projectRoot = graphNode.data.root;
        // Add existing known tsconfig files
        for (const tsconfigName of KNOWN_TSCONFIG_FILES) {
            const tsconfigPath = (0, devkit_1.joinPathFragments)(projectRoot, tsconfigName);
            if (tree.exists(tsconfigPath)) {
                uniqueTsConfigs.add(tsconfigPath);
            }
        }
        for (const [, target] of (0, targets_1.allProjectTargets)(graphNode.data)) {
            for (const [, options] of (0, targets_1.allTargetOptions)(target)) {
                if (typeof options?.tsConfig === 'string' &&
                    tree.exists(options.tsConfig) &&
                    // Exclude tsconfig.server.json - handled by update-ssr-webpack-config migration
                    !options.tsConfig.endsWith('tsconfig.server.json')) {
                    uniqueTsConfigs.add(options.tsConfig);
                }
            }
        }
    }
    for (const tsConfig of uniqueTsConfigs) {
        updateModuleAndModuleResolution(tree, tsConfig);
    }
    await (0, devkit_1.formatFiles)(tree);
}
function updateModuleAndModuleResolution(tree, tsConfigPath) {
    const ts = (0, internal_1.ensureTypescript)();
    // Read the resolved compiler options from the tsconfig
    const compilerOptions = (0, tsconfig_utils_1.readCompilerOptionsFromTsConfig)(tree, tsConfigPath);
    // Check if both module and moduleResolution are already set correctly
    if (compilerOptions.module === ts.ModuleKind.Preserve &&
        compilerOptions.moduleResolution === ts.ModuleResolutionKind.Bundler) {
        return;
    }
    // Ensure both module and moduleResolution are set to the correct values
    (0, devkit_1.updateJson)(tree, tsConfigPath, (json) => {
        json.compilerOptions ??= {};
        json.compilerOptions.module = 'preserve';
        json.compilerOptions.moduleResolution = 'bundler';
        return json;
    });
}
