"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSupportedAngularVersion = assertSupportedAngularVersion;
const internal_1 = require("@nx/devkit/internal");
const backward_compatible_versions_1 = require("./backward-compatible-versions");
const minSupportedAngularMajor = Math.min(...backward_compatible_versions_1.supportedVersions);
function assertSupportedAngularVersion(tree) {
    (0, internal_1.assertSupportedPackageVersion)(tree, '@angular/core', `${minSupportedAngularMajor}.0.0`);
}
