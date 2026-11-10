"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const ANGULAR_GENERATORS = [
    'application',
    'library',
    'host',
    'remote',
    'federate-module',
];
async function default_1(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson?.generators) {
        return;
    }
    let updated = false;
    for (const generator of ANGULAR_GENERATORS) {
        if (updateGeneratorDefault(nxJson.generators, '@nx/angular', generator)) {
            updated = true;
        }
    }
    if (updated) {
        (0, devkit_1.updateNxJson)(tree, nxJson);
        await (0, devkit_1.formatFiles)(tree);
    }
}
function updateGeneratorDefault(generators, collection, generator) {
    const generatorKey = `${collection}:${generator}`;
    // Check "@nx/angular:application" format
    const flatConfig = generators[generatorKey];
    if (flatConfig?.unitTestRunner === 'vitest') {
        flatConfig.unitTestRunner = 'vitest-analog';
        return true;
    }
    // Check { "@nx/angular": { "application": {...} } } format
    const nestedConfig = generators[collection];
    const generatorConfig = nestedConfig?.[generator];
    if (generatorConfig?.unitTestRunner === 'vitest') {
        generatorConfig.unitTestRunner = 'vitest-analog';
        return true;
    }
    return false;
}
