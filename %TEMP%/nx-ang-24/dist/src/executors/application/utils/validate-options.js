"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
const semver_1 = require("semver");
const angular_version_utils_1 = require("../../utilities/angular-version-utils");
function validateOptions(options) {
    const { version: angularVersion } = (0, angular_version_utils_1.getInstalledAngularVersionInfo)();
    if ((0, semver_1.lt)(angularVersion, '21.2.0')) {
        if (options.security?.allowedHosts) {
            throw new Error(`The "security.allowedHosts" option requires Angular version 21.2.0 or greater. You are currently using version ${angularVersion}.`);
        }
    }
    if ((0, semver_1.lt)(angularVersion, '20.1.0')) {
        if (options.loader) {
            const invalidLoaders = Array.from(new Set(Object.values(options.loader).filter((l) => l === 'dataurl' || l === 'base64')));
            if (invalidLoaders.length) {
                throw new Error(`Using the ${invalidLoaders
                    .map((l) => `"${l}"`)
                    .join(' and ')} loader${invalidLoaders.length > 1 ? 's' : ''} requires Angular version 20.1.0 or greater. You are currently using version ${angularVersion}.`);
            }
        }
    }
}
