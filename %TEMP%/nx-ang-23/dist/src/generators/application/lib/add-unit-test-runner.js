"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUnitTestRunner = addUnitTestRunner;
const test_runners_1 = require("../../../utils/test-runners");
const add_jest_1 = require("../../utils/add-jest");
const add_vitest_1 = require("../../utils/add-vitest");
async function addUnitTestRunner(host, options) {
    switch (options.unitTestRunner) {
        case test_runners_1.UnitTestRunner.Jest:
            await (0, add_jest_1.addJest)(host, {
                name: options.name,
                projectRoot: options.appProjectRoot,
                skipPackageJson: options.skipPackageJson,
                strict: options.strict,
                addPlugin: options.addPlugin,
                runtimeTsconfigFileName: 'tsconfig.app.json',
                zoneless: options.zoneless,
            });
            return () => { };
        case test_runners_1.UnitTestRunner.VitestAngular:
            return (0, add_vitest_1.addVitestAngular)(host, {
                name: options.name,
                projectRoot: options.appProjectRoot,
                skipPackageJson: options.skipPackageJson,
            });
        case test_runners_1.UnitTestRunner.VitestAnalog:
            return (0, add_vitest_1.addVitestAnalog)(host, {
                name: options.name,
                projectRoot: options.appProjectRoot,
                skipFormat: options.skipFormat,
                skipPackageJson: options.skipPackageJson,
                strict: options.strict,
                addPlugin: options.addPlugin,
                zoneless: options.zoneless,
            });
        default:
            return () => { };
    }
}
