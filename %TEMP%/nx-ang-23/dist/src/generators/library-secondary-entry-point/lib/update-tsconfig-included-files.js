"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTsConfigIncludedFiles = updateTsConfigIncludedFiles;
const devkit_1 = require("@nx/devkit");
function updateTsConfigIncludedFiles(tree, options) {
    const candidateTsConfigPaths = [
        options.libraryProject.targets?.build?.options?.tsConfig,
        (0, devkit_1.joinPathFragments)(options.libraryProject.root, 'tsconfig.lib.json'),
        (0, devkit_1.joinPathFragments)(options.libraryProject.root, 'tsconfig.json'),
    ];
    const tsConfigPath = candidateTsConfigPaths.find((path) => path && tree.exists(path));
    if (!tsConfigPath) {
        // ignore if the library has a custom tsconfig setup
        return;
    }
    const entryPointPrefix = `${options.name}/`;
    (0, devkit_1.updateJson)(tree, tsConfigPath, (json) => {
        if (json.include?.length) {
            const newIncludes = [];
            for (const pattern of json.include) {
                if (pattern.includes('*')) {
                    newIncludes.push(`${entryPointPrefix}${pattern}`);
                }
            }
            json.include = [...json.include, ...newIncludes];
        }
        if (json.exclude?.length) {
            const newExcludes = [];
            for (const pattern of json.exclude) {
                if (pattern.includes('*')) {
                    newExcludes.push(`${entryPointPrefix}${pattern}`);
                }
            }
            json.exclude = [...json.exclude, ...newExcludes];
        }
        return json;
    });
}
