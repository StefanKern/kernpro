"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadVite = loadVite;
exports.findVitestBaseConfig = findVitestBaseConfig;
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
// https://github.com/angular/angular-cli/blob/03b86fe28e34c489b91858614236dd14e2cb9985/packages/angular/build/src/builders/unit-test/runners/vitest/configuration.ts#L17-L28
const VITEST_CONFIG_FILES = [
    'vitest-base.config.ts',
    'vitest-base.config.mts',
    'vitest-base.config.cts',
    'vitest-base.config.js',
    'vitest-base.config.mjs',
    'vitest-base.config.cjs',
];
// TODO(jack): Remove this cast when @nx/angular switches to moduleResolution:
// "nodenext". Vite 8 ships ESM-only type declarations (.d.mts) not resolvable
// under moduleResolution: "node".
function loadVite() {
    return Function('return import("vite")')();
}
async function findVitestBaseConfig(searchDirs) {
    for (const dir of searchDirs) {
        try {
            const entries = await (0, promises_1.readdir)(dir, { withFileTypes: true });
            const files = new Set(entries.filter((e) => e.isFile()).map((e) => e.name));
            for (const configFile of VITEST_CONFIG_FILES) {
                if (files.has(configFile)) {
                    return (0, node_path_1.join)(dir, configFile);
                }
            }
        }
        catch {
            // Ignore directories that cannot be read
        }
    }
    return false;
}
