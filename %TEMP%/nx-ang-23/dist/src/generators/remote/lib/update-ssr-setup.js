"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSsrSetup = updateSsrSetup;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const path_1 = require("path");
const semver_1 = require("semver");
const versions_1 = require("../../../utils/versions");
const artifact_types_1 = require("../../utils/artifact-types");
const version_utils_1 = require("../../utils/version-utils");
async function updateSsrSetup(tree, { appName, port, standalone, typescriptConfiguration, zoneless, skipPackageJson, }) {
    const { major: angularMajorVersion, version: angularVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    let project = (0, devkit_1.readProjectConfiguration)(tree, appName);
    const sourceRoot = (0, internal_1.getProjectSourceRoot)(project, tree);
    tree.rename((0, devkit_1.joinPathFragments)(sourceRoot, 'main.server.ts'), (0, devkit_1.joinPathFragments)(sourceRoot, 'bootstrap.server.ts'));
    const pathToServerEntry = (0, devkit_1.joinPathFragments)(sourceRoot, 'server.ts');
    tree.write(pathToServerEntry, `import('./main.server');`);
    const browserBundleOutput = project.targets.build.options.outputPath;
    const serverBundleOutput = project.targets.build.options.outputPath.replace(/\/browser$/, '/server');
    (0, devkit_1.generateFiles)(tree, (0, path_1.join)(__dirname, '../files/common'), project.root, {
        appName,
        browserBundleOutput,
        serverBundleOutput,
        standalone,
        zoneless,
        useDefaultImport: angularMajorVersion >= 21,
        angularMajorVersion,
        supportsAllowedHosts: (0, version_utils_1.supportsSsrAllowedHosts)(tree),
        tmpl: '',
    });
    const pathToTemplateFiles = typescriptConfiguration ? 'base-ts' : 'base';
    (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, `../files/${pathToTemplateFiles}`), project.root, {
        tmpl: '',
    });
    if (standalone) {
        const componentType = (0, artifact_types_1.getComponentType)(tree);
        const componentFileSuffix = componentType ? `.${componentType}` : '';
        // https://github.com/angular/angular-cli/releases/tag/20.3.0
        const useBootstrapContext = (0, semver_1.gte)(angularVersion, '20.3.0');
        (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, '../files/standalone'), project.root, {
            appName,
            standalone,
            componentType: componentType ? (0, devkit_1.names)(componentType).className : '',
            componentFileSuffix,
            useBootstrapContext,
            tmpl: '',
        });
    }
    // update project.json
    project = (0, devkit_1.readProjectConfiguration)(tree, appName);
    project.targets.server.executor = '@nx/angular:webpack-server';
    project.targets.server.options.customWebpackConfig = {
        path: (0, devkit_1.joinPathFragments)(project.root, `webpack.server.config.${typescriptConfiguration ? 'ts' : 'js'}`),
    };
    if (project.targets.server.configurations &&
        project.targets.server.configurations.development) {
        if ('vendorChunk' in project.targets.server.configurations.development) {
            delete project.targets.server.configurations.development.vendorChunk;
        }
    }
    project.targets['serve-ssr'].options = {
        ...(project.targets['serve-ssr'].options ?? {}),
        port,
    };
    project.targets['static-server'] = {
        dependsOn: ['build', 'server'],
        executor: 'nx:run-commands',
        options: {
            command: `PORT=${port} node ${(0, devkit_1.joinPathFragments)(project.targets.server.options.outputPath, 'main.js')}`,
        },
    };
    (0, devkit_1.updateProjectConfiguration)(tree, appName, project);
    if (!skipPackageJson) {
        return (0, devkit_1.addDependenciesToPackageJson)(tree, {
            cors: versions_1.corsVersion,
            '@module-federation/node': versions_1.moduleFederationNodeVersion,
        }, {
            '@types/cors': versions_1.typesCorsVersion,
        });
    }
    return () => { };
}
