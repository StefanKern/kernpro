"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
const devkit_1 = require("@nx/devkit");
const angular_version_utils_1 = require("../../../executors/utilities/angular-version-utils");
function validateOptions(options) {
    const { major: angularMajorVersion, version: angularVersion } = (0, angular_version_utils_1.getInstalledAngularVersionInfo)();
    if (angularMajorVersion < 21) {
        if (options.define && Object.keys(options.define).length > 0) {
            throw new Error((0, devkit_1.stripIndents) `The "define" option is only supported in Angular >= 21.0.0. You are currently using "${angularVersion}".
        You can resolve this error by removing the "define" option or by migrating to Angular 21.0.0.`);
        }
    }
}
