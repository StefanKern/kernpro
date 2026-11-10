"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
const version_utils_1 = require("../../utils/version-utils");
function validateOptions(tree, options) {
    const { major: angularMajorVersion, version: angularVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    if (angularMajorVersion < 21) {
        if (options.zoneless) {
            throw new Error(`The "zoneless" option is only supported for Angular versions >= 21.0.0. You are using Angular ${angularVersion}.`);
        }
    }
}
