"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTsconfig = updateTsconfig;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
function updateTsconfig(tree, projectRoot) {
    const tsconfigPath = (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.json');
    const tsconfig = (0, devkit_1.readJson)(tree, tsconfigPath);
    tsconfig['ts-node'] ??= {};
    tsconfig['ts-node'].compilerOptions ??= {};
    tsconfig['ts-node'].compilerOptions.module = 'CommonJS';
    tsconfig['ts-node'].compilerOptions.moduleResolution = 'Node10';
    if (tsconfig.compilerOptions?.customConditions) {
        tsconfig['ts-node'].compilerOptions.customConditions = null;
    }
    else {
        const rootTsconfigFile = (0, js_1.getRootTsConfigFileName)(tree);
        if (rootTsconfigFile) {
            const rootTsconfigJson = (0, devkit_1.readJson)(tree, rootTsconfigFile);
            if (rootTsconfigJson.compilerOptions?.customConditions) {
                tsconfig['ts-node'].compilerOptions.customConditions = null;
            }
        }
    }
    (0, devkit_1.writeJson)(tree, tsconfigPath, tsconfig);
}
