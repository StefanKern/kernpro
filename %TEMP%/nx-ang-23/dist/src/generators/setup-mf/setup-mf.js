"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupMf = setupMf;
const devkit_1 = require("@nx/devkit");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const versions_1 = require("../../utils/versions");
const version_utils_1 = require("../utils/version-utils");
const lib_1 = require("./lib");
async function setupMf(tree, rawOptions) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    const options = (0, lib_1.normalizeOptions)(tree, rawOptions);
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.appName);
    const tasks = [];
    if (options.mfType === 'remote') {
        (0, lib_1.addRemoteToHost)(tree, {
            appName: options.appName,
            host: options.host,
            standalone: options.standalone,
            port: options.port,
        });
        (0, lib_1.addRemoteEntry)(tree, options, projectConfig.root);
        (0, lib_1.removeDeadCodeFromRemote)(tree, options);
        (0, lib_1.setupTspathForRemote)(tree, options);
        if (!options.skipPackageJson) {
            tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {
                '@module-federation/enhanced': versions_1.moduleFederationEnhancedVersion,
            }, {
                '@nx/web': versions_1.nxVersion,
                '@nx/webpack': versions_1.nxVersion,
                'webpack-merge': versions_1.webpackMergeVersion,
                '@nx/module-federation': versions_1.nxVersion,
            }));
        }
    }
    const remotesWithPorts = (0, lib_1.getRemotesWithPorts)(tree, options);
    (0, lib_1.generateWebpackConfig)(tree, options, projectConfig.root, remotesWithPorts);
    (0, lib_1.changeBuildTarget)(tree, options);
    (0, lib_1.updateTsConfig)(tree, options);
    (0, lib_1.setupServeTarget)(tree, options);
    if (options.mfType === 'host') {
        (0, lib_1.setupHostIfDynamic)(tree, options);
        (0, lib_1.updateHostAppRoutes)(tree, options);
        for (const { remoteName, port } of remotesWithPorts) {
            (0, lib_1.addRemoteToHost)(tree, {
                appName: remoteName,
                host: options.appName,
                standalone: options.standalone,
                port,
            });
        }
        if (!options.skipPackageJson) {
            tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
                '@nx/webpack': versions_1.nxVersion,
                'webpack-merge': versions_1.webpackMergeVersion,
                '@module-federation/enhanced': versions_1.moduleFederationEnhancedVersion,
                '@nx/module-federation': versions_1.nxVersion,
            }));
        }
    }
    (0, lib_1.fixBootstrap)(tree, projectConfig.root, options);
    if (options.mfType === 'host' || options.federationType === 'dynamic') {
        /**
         * Host applications and dynamic federation applications generate runtime
         * code that depends on the @nx/angular plugin. Ensure that the plugin is
         * in the production dependencies.
         */
        (0, lib_1.moveAngularPluginToDependencies)(tree);
    }
    if (!options.skipE2E) {
        (0, lib_1.addCypressOnErrorWorkaround)(tree, options);
    }
    if (!options.skipPackageJson && options.typescriptConfiguration) {
        // Angular custom-webpack loads webpack.config.ts at build time. Node native
        // TS strip can't resolve the extensionless `./module-federation.config`
        // import under strict ESM, so loadTsFile needs ts-node as the fallback.
        tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, { 'ts-node': versions_1.tsNodeVersion }, undefined, true));
    }
    if (!options.skipPackageJson) {
        const angularDevkitVersion = (0, version_utils_1.getInstalledAngularDevkitVersion)(tree) ??
            (0, version_utils_1.versions)(tree).angularDevkitVersion;
        // the executors used by MF require @angular-devkit/build-angular
        tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@angular-devkit/build-angular': angularDevkitVersion }, undefined, true));
    }
    // format files
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = setupMf;
