"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComponentType = getComponentType;
exports.getModuleTypeSeparator = getModuleTypeSeparator;
const devkit_1 = require("@nx/devkit");
function getComponentType(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    const componentType = nxJson.generators?.['@nx/angular:component']?.type ??
        nxJson.generators?.['@nx/angular']?.component?.type;
    return componentType;
}
function getModuleTypeSeparator(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    // We don't have a "module" generator but the @nx/angular collection extends
    // from the @schematics/angular collection so the "module" generator is
    // available there. We check for a generator default for each collection.
    let typeSeparator = nxJson.generators?.['@nx/angular:module']?.typeSeparator ??
        nxJson.generators?.['@nx/angular']?.module?.typeSeparator ??
        nxJson.generators?.['@schematics/angular:module']?.typeSeparator ??
        nxJson.generators?.['@schematics/angular']?.module?.typeSeparator;
    if (!typeSeparator) {
        typeSeparator = '-';
    }
    return typeSeparator;
}
