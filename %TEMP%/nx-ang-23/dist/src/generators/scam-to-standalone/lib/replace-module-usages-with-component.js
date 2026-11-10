"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceModuleUsagesWithComponent = replaceModuleUsagesWithComponent;
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
function replaceModuleUsagesWithComponent(tree, moduleName, componentName) {
    (0, devkit_1.visitNotIgnoredFiles)(tree, '/', (path) => {
        if ((0, path_1.extname)(path) !== '.ts') {
            return;
        }
        const fileContents = tree.read(path, 'utf-8');
        if (fileContents.includes(moduleName)) {
            // Word boundary \b ensures that other modules won't be affected.
            // E.g. "MapIconModule" would not be affected when "IconModule" is being migrated.
            const moduleNameRegex = new RegExp(`\\b${moduleName}\\b`, 'g');
            const newFileContents = fileContents.replace(moduleNameRegex, componentName);
            tree.write(path, newFileContents);
        }
    });
}
