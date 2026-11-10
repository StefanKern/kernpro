"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupTspathForRemote = setupTspathForRemote;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const versions_1 = require("../../../utils/versions");
function setupTspathForRemote(tree, options) {
    const { normalizeProjectName } = (0, devkit_1.ensurePackage)('@nx/module-federation', versions_1.nxVersion);
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.appName);
    const exportPath = options.standalone
        ? `./src/app/remote-entry/entry.routes.ts`
        : `./src/app/remote-entry/${options.entryModuleFileName}.ts`;
    const exportName = options.standalone ? 'Routes' : 'Module';
    (0, js_1.addTsConfigPath)(tree, `${normalizeProjectName(options.appName)}/${exportName}`, [(0, devkit_1.joinPathFragments)(project.root, exportPath)]);
}
