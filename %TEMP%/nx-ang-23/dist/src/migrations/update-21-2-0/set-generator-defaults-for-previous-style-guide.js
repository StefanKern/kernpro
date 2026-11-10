"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const TYPE_GENERATORS = ['component', 'directive', 'service'];
const TYPE_SEPARATOR_GENERATORS = [
    'guard',
    'interceptor',
    'module',
    'pipe',
    'resolver',
];
async function default_1(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    nxJson.generators ??= {};
    for (const generator of TYPE_GENERATORS) {
        setDefault(nxJson.generators, '@nx/angular', generator, 'type', generator);
        setDefault(nxJson.generators, '@schematics/angular', generator, 'type', generator);
    }
    setDefault(nxJson.generators, '@nx/angular', 'scam', 'type', 'component');
    setDefault(nxJson.generators, '@nx/angular', 'scam-directive', 'type', 'directive');
    for (const generator of TYPE_SEPARATOR_GENERATORS) {
        setDefault(nxJson.generators, '@nx/angular', generator, 'typeSeparator', '.');
        setDefault(nxJson.generators, '@schematics/angular', generator, 'typeSeparator', '.');
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
    await (0, devkit_1.formatFiles)(tree);
}
function setDefault(generators, collection, generator, option, value) {
    const generatorKey = `${collection}:${generator}`;
    if (generators[generatorKey]?.[option] ||
        generators[collection]?.[generator]?.[option]) {
        return;
    }
    if (generators[generatorKey]) {
        generators[generatorKey][option] = value;
    }
    else if (generators[collection]?.[generator]) {
        generators[collection][generator][option] = value;
    }
    else if (generators[collection]) {
        generators[collection][generator] = { [option]: value };
    }
    else {
        generators[generatorKey] = { [option]: value };
    }
}
