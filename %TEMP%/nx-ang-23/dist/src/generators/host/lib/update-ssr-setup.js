"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSsrSetup = updateSsrSetup;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const path_1 = require("path");
const versions_1 = require("../../../utils/versions");
const version_utils_1 = require("../../utils/version-utils");
async function updateSsrSetup(tree, options, appName, typescriptConfiguration) {
    let project = (0, devkit_1.readProjectConfiguration)(tree, appName);
    const sourceRoot = (0, internal_1.getProjectSourceRoot)(project, tree);
    tree.rename((0, devkit_1.joinPathFragments)(sourceRoot, 'main.server.ts'), (0, devkit_1.joinPathFragments)(sourceRoot, 'bootstrap.server.ts'));
    const pathToServerEntry = (0, devkit_1.joinPathFragments)(sourceRoot, 'server.ts');
    tree.write(pathToServerEntry, `import('./main.server');`);
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, '../files/common'), project.root, {
        appName,
        browserBundleOutput: project.targets.build.options.outputPath,
        standalone: options.standalone,
        zoneless: options.zoneless,
        useDefaultImport: angularMajorVersion >= 21,
        angularMajorVersion,
        supportsAllowedHosts: (0, version_utils_1.supportsSsrAllowedHosts)(tree),
        tmpl: '',
    });
    const pathToTemplateFiles = typescriptConfiguration ? 'ts' : 'js';
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, '../files', pathToTemplateFiles), project.root, {
        tmpl: '',
    });
    // update project.json
    project = (0, devkit_1.readProjectConfiguration)(tree, appName);
    project.targets.server.executor = '@nx/angular:webpack-server';
    project.targets.server.options.customWebpackConfig = {
        path: (0, devkit_1.joinPathFragments)(project.root, `webpack.server.config.${pathToTemplateFiles}`),
    };
    if (project.targets.server.configurations &&
        project.targets.server.configurations.development) {
        if ('vendorChunk' in project.targets.server.configurations.development) {
            delete project.targets.server.configurations.development.vendorChunk;
        }
    }
    project.targets['serve-ssr'].executor =
        '@nx/angular:module-federation-dev-ssr';
    (0, devkit_1.updateProjectConfiguration)(tree, appName, project);
    if (!options.skipPackageJson) {
        return (0, devkit_1.addDependenciesToPackageJson)(tree, {
            cors: versions_1.corsVersion,
            '@module-federation/node': versions_1.moduleFederationNodeVersion,
        }, {
            '@types/cors': versions_1.typesCorsVersion,
        });
    }
    return () => { };
}
