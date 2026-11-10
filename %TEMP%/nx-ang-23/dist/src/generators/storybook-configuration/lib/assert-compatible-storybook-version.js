"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCompatibleStorybookVersion = assertCompatibleStorybookVersion;
const semver_1 = require("semver");
function assertCompatibleStorybookVersion() {
    let storybookVersion;
    try {
        storybookVersion = require(require.resolve('@storybook/angular/package.json')).version;
    }
    catch { }
    if (storybookVersion && (0, semver_1.lt)(storybookVersion, '8.0.0')) {
        throw new Error('Incompatible Storybook Version: Please use a version 8.0.0 or higher of @storybook/angular');
    }
}
