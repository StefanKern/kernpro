"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addServeStaticTarget = addServeStaticTarget;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../../utils/versions");
function addServeStaticTarget(tree, options, port) {
    addFileServerTarget(tree, options, 'serve-static', port);
}
function addFileServerTarget(tree, options, targetName, e2ePort) {
    if (!options.skipPackageJson) {
        (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@nx/web': versions_1.nxVersion });
    }
    const isUsingApplicationBuilder = options.bundler === 'esbuild';
    const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, options.name);
    projectConfig.targets[targetName] = {
        continuous: true,
        executor: '@nx/web:file-server',
        options: {
            buildTarget: `${options.name}:build`,
            port: e2ePort,
            staticFilePath: isUsingApplicationBuilder
                ? (0, devkit_1.joinPathFragments)(options.outputPath, 'browser')
                : undefined,
            spa: true,
        },
    };
    (0, devkit_1.updateProjectConfiguration)(tree, options.name, projectConfig);
}
