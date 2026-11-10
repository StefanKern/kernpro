"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstalledAngularDevkitVersion = getInstalledAngularDevkitVersion;
exports.getInstalledAngularVersion = getInstalledAngularVersion;
exports.getInstalledAngularMajorVersion = getInstalledAngularMajorVersion;
exports.getInstalledAngularVersionInfo = getInstalledAngularVersionInfo;
exports.getInstalledPackageVersionInfo = getInstalledPackageVersionInfo;
exports.supportsSsrAllowedHosts = supportsSsrAllowedHosts;
exports.withSsrAllowedHostsSupport = withSsrAllowedHostsSupport;
exports.versions = versions;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const semver_1 = require("semver");
const backward_compatible_versions_1 = require("../../utils/backward-compatible-versions");
const latestVersions = tslib_1.__importStar(require("../../utils/versions"));
const versions_1 = require("../../utils/versions");
function getInstalledAngularDevkitVersion(tree) {
    return ((0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@angular-devkit/build-angular') ?? (0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@angular/build'));
}
function getInstalledAngularVersion(tree) {
    return (0, internal_1.getDeclaredPackageVersion)(tree, '@angular/core', versions_1.angularVersion);
}
function getInstalledAngularMajorVersion(tree) {
    return (0, semver_1.major)(getInstalledAngularVersion(tree));
}
function getInstalledAngularVersionInfo(tree) {
    const installedVersion = getInstalledAngularVersion(tree);
    return {
        version: installedVersion,
        major: (0, semver_1.major)(installedVersion),
    };
}
function getInstalledPackageVersionInfo(tree, pkgName) {
    const version = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, pkgName);
    return version ? { major: (0, semver_1.major)((0, semver_1.coerce)(version)), version } : null;
}
// Released in 20.3.17, 21.1.5 and 21.2.0, and never backported to 21.0.
// Prereleases are deliberately not matched: the option landed part-way through
// the 21.2 prerelease train, so a prerelease says nothing about whether it is
// there.
const SSR_ALLOWED_HOSTS_RANGE = '>=20.3.17 <21.0.0 || >=21.1.5';
const SSR_ALLOWED_HOSTS_FLOORS = ['20.3.17', '21.1.5', '21.2.0'];
// A single caret, tilde or exact version. Raising anything else, a union of
// ranges above all, would drop the release lines it covers.
const RAISABLE_RANGE = /^[~^]?\d+\.\d+\.\d+(?:-[\w.]+)?$/;
/**
 * Whether every `@angular/ssr` version a range allows accepts an allowed hosts
 * configuration. A range is not always resolved to its highest version, the
 * `resolution-mode` setting in pnpm being one way to ask for the lowest, so a
 * range that merely reaches such a version is not enough.
 */
function rangeAcceptsSsrAllowedHosts(range) {
    return !!(0, semver_1.validRange)(range) && (0, semver_1.subset)(range, SSR_ALLOWED_HOSTS_RANGE);
}
/**
 * Whether every `@angular/ssr` version the workspace can end up with accepts
 * an allowed hosts configuration. The application engine and `CommonEngine`
 * validate the request host against it, and an unset allowlist matches nothing.
 */
function supportsSsrAllowedHosts(tree) {
    const installed = (0, internal_1.getInstalledPackageVersionFromTree)(tree, '@angular/ssr');
    if (installed) {
        return (0, semver_1.satisfies)(installed, SSR_ALLOWED_HOSTS_RANGE);
    }
    const declared = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@angular/ssr');
    return !!declared && rangeAcceptsSsrAllowedHosts(declared);
}
/**
 * Raises the floor of an `@angular/ssr` version range to the first version in
 * it that accepts an allowed hosts configuration, so the scaffolded setup can
 * use the option no matter how the range is resolved. The range is returned
 * unchanged when every version it allows already accepts one, when no version
 * in it does, and when raising it would change the release lines it covers.
 */
function withSsrAllowedHostsSupport(range) {
    if (rangeAcceptsSsrAllowedHosts(range) || !RAISABLE_RANGE.test(range)) {
        return range;
    }
    const floor = SSR_ALLOWED_HOSTS_FLOORS.find((version) => (0, semver_1.satisfies)(version, range));
    if (!floor) {
        return range;
    }
    const operator = range.startsWith('~') || range.startsWith('^') ? range[0] : '';
    const raised = `${operator}${floor}`;
    return rangeAcceptsSsrAllowedHosts(raised) ? raised : range;
}
function versions(tree, options) {
    const majorAngularVersion = getInstalledAngularMajorVersion(tree);
    if (options?.minAngularMajorVersion &&
        majorAngularVersion < options.minAngularMajorVersion) {
        throw new Error(`This operation requires Angular ${options.minAngularMajorVersion}+, but found version ${majorAngularVersion}. ` +
            `This shouldn't happen. Please report it as a bug and include the stack trace.`);
    }
    return backward_compatible_versions_1.backwardCompatibleVersions[majorAngularVersion] ?? latestVersions;
}
