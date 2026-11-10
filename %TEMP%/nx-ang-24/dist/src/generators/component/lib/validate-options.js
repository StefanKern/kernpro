"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
const version_utils_1 = require("../../utils/version-utils");
function validateOptions(tree, options) {
    const { major: angularMajorVersion, version: angularVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    if (options.changeDetection === 'Eager' && angularMajorVersion < 22) {
        throw new Error(`The "Eager" change detection strategy is only supported for Angular versions >= 22.0.0. You are using Angular ${angularVersion}.`);
    }
}
