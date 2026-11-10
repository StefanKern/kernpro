"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateOptions = validateOptions;
const test_runners_1 = require("../../../utils/test-runners");
const version_utils_1 = require("../../utils/version-utils");
function validateOptions(tree, options) {
    if (!options.routing && options.lazy) {
        throw new Error(`To use "--lazy" option, "--routing" must also be set.`);
    }
    if (options.publishable === true && !options.importPath) {
        throw new Error(`For publishable libs you have to provide a proper "--importPath" which needs to be a valid npm package name (e.g. my-awesome-lib or @myorg/my-lib)`);
    }
    if (options.unitTestRunner === test_runners_1.UnitTestRunner.VitestAngular) {
        const { major: angularMajorVersion, version: angularVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
        if (angularMajorVersion < 21) {
            throw new Error(`The "vitest-angular" unit test runner requires Angular v21 or higher. ` +
                `Detected Angular v${angularVersion}. Use "vitest-analog" or "jest" instead.`);
        }
        if (!options.buildable && !options.publishable) {
            throw new Error(`The "vitest-angular" unit test runner requires the library to be buildable or publishable. ` +
                `Use "vitest-analog" or "jest" instead.`);
        }
    }
}
