"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTailwindConfigPath = getTailwindConfigPath;
const fs_1 = require("fs");
const path_1 = require("path");
function getTailwindConfigPath(projectRoot, workspaceRoot) {
    // valid tailwind config files https://github.com/tailwindlabs/tailwindcss/blob/master/src/util/resolveConfigPath.js#L4
    const tailwindConfigFiles = [
        'tailwind.config.js',
        'tailwind.config.cjs',
        'tailwind.config.mjs',
        'tailwind.config.ts',
    ];
    for (const basePath of [projectRoot, workspaceRoot]) {
        for (const configFile of tailwindConfigFiles) {
            const fullPath = (0, path_1.join)(basePath, configFile);
            if ((0, fs_1.existsSync)(fullPath)) {
                return fullPath;
            }
        }
    }
    return undefined;
}
