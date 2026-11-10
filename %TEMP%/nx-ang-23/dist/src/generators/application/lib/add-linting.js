"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addLinting = addLinting;
const tslib_1 = require("tslib");
const internal_1 = require("@nx/eslint/internal");
const add_linting_1 = tslib_1.__importDefault(require("../../add-linting/add-linting"));
async function addLinting(host, options) {
    if (options.linter === 'none') {
        return;
    }
    await (0, add_linting_1.default)(host, {
        linter: options.linter,
        projectName: options.name,
        projectRoot: options.appProjectRoot,
        prefix: options.prefix,
        enableTypedLinting: (0, internal_1.isTypedLintingEnabled)(options),
        skipPackageJson: options.skipPackageJson,
        unitTestRunner: options.unitTestRunner,
        skipFormat: true,
        addPlugin: options.addPlugin,
    });
}
