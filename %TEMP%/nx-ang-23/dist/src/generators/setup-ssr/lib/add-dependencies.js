"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addDependencies = addDependencies;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
const version_utils_1 = require("../../utils/version-utils");
function addDependencies(tree, options) {
    const pkgVersions = (0, version_utils_1.versions)(tree);
    const dependencies = {
        '@angular/platform-server': (0, devkit_1.getDependencyVersionFromPackageJson)(tree, '@angular/platform-server') ??
            pkgVersions.angularVersion,
        express: pkgVersions.expressVersion,
    };
    const devDependencies = {
        '@types/express': pkgVersions.typesExpressVersion,
        '@types/node': pkgVersions.typesNodeVersion,
    };
    const angularDevkitVersion = (0, version_utils_1.getInstalledAngularDevkitVersion)(tree) ?? pkgVersions.angularDevkitVersion;
    // The setup below configures the allowed hosts when the version allows it,
    // so ask for one that does rather than for whichever the range resolves to
    dependencies['@angular/ssr'] =
        (0, version_utils_1.withSsrAllowedHostsSupport)(angularDevkitVersion);
    if (options.isUsingApplicationBuilder) {
        dependencies['@angular-devkit/build-angular'] = angularDevkitVersion;
    }
    else if (!options.isRspack) {
        // The rspack conversion removes the targets that use these packages
        devDependencies['browser-sync'] = pkgVersions.browserSyncVersion;
        if (options.isUsingWebpackBuilder) {
            devDependencies['@nx/webpack'] = versions_1.nxVersion;
            devDependencies['webpack-merge'] = pkgVersions.webpackMergeVersion;
        }
    }
    (0, devkit_1.addDependenciesToPackageJson)(tree, dependencies, devDependencies, undefined, true);
}
