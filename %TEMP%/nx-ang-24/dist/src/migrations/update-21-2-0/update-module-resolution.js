"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
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
                    tree.exists(options.tsConfig)) {
                    uniqueTsConfigs.add(options.tsConfig);
                }
            }
        }
    }
    for (const tsConfig of uniqueTsConfigs) {
        updateModuleResolution(tree, tsConfig);
    }
    await (0, devkit_1.formatFiles)(tree);
}
function updateModuleResolution(tree, tsConfigPath) {
    const tsConfig = (0, devkit_1.readJson)(tree, tsConfigPath);
    if (!tsConfig.compilerOptions) {
        return;
    }
    const { compilerOptions } = tsConfig;
    // Only update if module is not 'preserve' and moduleResolution is not already 'bundler'
    if (compilerOptions.module === 'preserve' ||
        compilerOptions.moduleResolution === 'bundler') {
        return;
    }
    // Update moduleResolution to 'bundler'
    (0, devkit_1.updateJson)(tree, tsConfigPath, (json) => {
        json.compilerOptions ??= {};
        json.compilerOptions.moduleResolution = 'bundler';
        return json;
    });
}
