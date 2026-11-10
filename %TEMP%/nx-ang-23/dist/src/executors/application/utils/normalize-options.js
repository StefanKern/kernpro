"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const angular_version_utils_1 = require("../../utilities/angular-version-utils");
function normalizeOptions(options) {
    return { ...options, ssr: coerceSsrPlatform(options.ssr) };
}
// `platform` is the option name from Angular v22 onwards; earlier majors use
// `experimentalPlatform`. We accept both and forward the one the installed
// builder understands so a `neutral` value is never silently dropped.
function coerceSsrPlatform(ssr) {
    if (!ssr || typeof ssr !== 'object') {
        return ssr;
    }
    const { platform, experimentalPlatform, ...rest } = ssr;
    const resolvedPlatform = platform ?? experimentalPlatform;
    if (resolvedPlatform === undefined) {
        return ssr;
    }
    // `validateOptions` runs first and asserts Angular is installed, so the
    // version info is always present here.
    const { major: angularMajorVersion } = (0, angular_version_utils_1.getInstalledAngularVersionInfo)();
    return (angularMajorVersion >= 22
        ? { ...rest, platform: resolvedPlatform }
        : { ...rest, experimentalPlatform: resolvedPlatform });
}
