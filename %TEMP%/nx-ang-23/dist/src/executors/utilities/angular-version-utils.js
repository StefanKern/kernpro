"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledAngularVersionInfo = getInstalledAngularVersionInfo;
exports.getInstalledPackageVersionInfo = getInstalledPackageVersionInfo;
const internal_1 = require("@nx/devkit/internal");
const semver_1 = require("semver");
function getInstalledAngularVersionInfo() {
    return getInstalledPackageVersionInfo('@angular/core');
}
function getInstalledPackageVersionInfo(pkgName) {
    const version = (0, internal_1.getInstalledPackageVersion)(pkgName);
    return version ? { major: (0, semver_1.major)(version), version } : null;
}
