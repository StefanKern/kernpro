"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTsConfigBase = void 0;
exports.updateProjectRootTsConfig = updateProjectRootTsConfig;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
var js_1 = require("@nx/js");
Object.defineProperty(exports, "extractTsConfigBase", { enumerable: true, get: function () { return js_1.extractTsConfigBase; } });
function updateProjectRootTsConfig(host, projectRoot, relativePathToRootTsConfig, isRootProject) {
    (0, devkit_1.updateJson)(host, `${projectRoot}/tsconfig.json`, (json) => {
        if (isRootProject) {
            // inline tsconfig.base.json into the project
            json.compileOnSave = false;
            json.compilerOptions = {
                ...(0, internal_1.getTsConfigBaseOptions)(host),
                ...json.compilerOptions,
            };
            json.exclude = ['node_modules', 'tmp'];
            delete json.extends;
        }
        else {
            json.extends = relativePathToRootTsConfig;
        }
        return json;
    });
}
