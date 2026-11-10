"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
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
                    tree.exists(options.tsConfig)) {
                    uniqueTsConfigs.add(options.tsConfig);
                }
            }
        }
    }
    for (const tsConfig of uniqueTsConfigs) {
        updateTypeScriptLib(tree, tsConfig);
    }
    await (0, devkit_1.formatFiles)(tree);
}
function updateTypeScriptLib(tree, tsConfigPath) {
    // Read resolved compiler options (includes extends chain)
    const { lib: resolvedLib } = (0, tsconfig_utils_1.readCompilerOptionsFromTsConfig)(tree, tsConfigPath);
    // Check if already correct
    if (!resolvedLib || !Array.isArray(resolvedLib)) {
        return; // No lib to update
    }
    // Normalize lib entries from TypeScript's full format (e.g., 'lib.es2020.d.ts')
    const normalizedResolvedLib = resolvedLib.map((l) => typeof l === 'string' ? normalizeLibEntry(l) : l);
    const esLibs = normalizedResolvedLib.filter((l) => typeof l === 'string' && l.toLowerCase().startsWith('es'));
    if (esLibs.length === 0) {
        return; // No ES libs to update
    }
    const esLibToVersion = new Map();
    for (const l of esLibs) {
        const version = l.toLowerCase().match(/^es(next|(\d+))$/)?.[1];
        if (version) {
            // Use lowercase key for case-insensitive comparison
            esLibToVersion.set(l.toLowerCase(), version === 'next' ? Infinity : Number(version));
        }
    }
    if (esLibToVersion.size === 0) {
        return;
    }
    const latestVersion = Math.max(...esLibToVersion.values());
    // Only upgrade if ES version is strictly less than 2022
    if (latestVersion < 2022) {
        (0, devkit_1.updateJson)(tree, tsConfigPath, (json) => {
            json.compilerOptions ??= {};
            const directLib = json.compilerOptions.lib;
            const sourceLib = directLib && Array.isArray(directLib)
                ? directLib
                : normalizedResolvedLib;
            // Filter out old ES versions (case-insensitive) and add ES2022
            const otherLibs = sourceLib.filter((l) => {
                if (typeof l === 'string') {
                    return !esLibToVersion.has(l.toLowerCase());
                }
                return true;
            });
            json.compilerOptions.lib = [...otherLibs, 'es2022'];
            return json;
        });
    }
}
/**
 * Normalize lib entry from TypeScript's full format (e.g., 'lib.es2020.d.ts')
 * to the shorthand format (e.g., 'es2020')
 */
function normalizeLibEntry(lib) {
    // TypeScript's parseJsonConfigFileContent returns full lib file names like 'lib.es2020.d.ts'
    // We need to extract just 'es2020' from it
    if (lib.startsWith('lib.') && lib.endsWith('.d.ts')) {
        return lib.slice(4, -5); // Remove 'lib.' prefix and '.d.ts' suffix
    }
    return lib;
}
