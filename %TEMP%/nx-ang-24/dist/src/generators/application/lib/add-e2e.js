"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addE2e = addE2e;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const versions_1 = require("../../../utils/versions");
async function addE2e(tree, options) {
    const e2eWebServerInfo = getAngularE2EWebServerInfo(tree, options.name, options.port);
    if (options.e2eTestRunner === 'cypress') {
        const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/cypress', versions_1.nxVersion);
        (0, devkit_1.addProjectConfiguration)(tree, options.e2eProjectName, {
            projectType: 'application',
            root: options.e2eProjectRoot,
            sourceRoot: (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'src'),
            targets: {},
            tags: [],
            implicitDependencies: [options.name],
        });
        await configurationGenerator(tree, {
            project: options.e2eProjectName,
            directory: 'src',
            linter: options.linter,
            skipPackageJson: options.skipPackageJson,
            skipFormat: true,
            devServerTarget: e2eWebServerInfo.e2eDevServerTarget,
            baseUrl: e2eWebServerInfo.e2eWebServerAddress,
            webServerCommands: {
                default: e2eWebServerInfo.e2eWebServerCommand,
                production: e2eWebServerInfo.e2eCiWebServerCommand,
            },
            ciWebServerCommand: e2eWebServerInfo.e2eCiWebServerCommand,
            ciBaseUrl: e2eWebServerInfo.e2eCiBaseUrl,
            rootProject: options.rootProject,
        });
    }
    else if (options.e2eTestRunner === 'playwright') {
        const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/playwright', versions_1.nxVersion);
        (0, devkit_1.addProjectConfiguration)(tree, options.e2eProjectName, {
            projectType: 'application',
            root: options.e2eProjectRoot,
            sourceRoot: (0, devkit_1.joinPathFragments)(options.e2eProjectRoot, 'src'),
            targets: {},
            implicitDependencies: [options.name],
        });
        await configurationGenerator(tree, {
            project: options.e2eProjectName,
            skipFormat: true,
            skipPackageJson: options.skipPackageJson,
            directory: 'src',
            js: false,
            linter: options.linter,
            enableTypedLinting: options.enableTypedLinting,
            webServerCommand: e2eWebServerInfo.e2eWebServerCommand,
            webServerAddress: e2eWebServerInfo.e2eWebServerAddress,
            ciWebServerCommand: e2eWebServerInfo.e2eCiWebServerCommand,
            ciWebServerAddress: e2eWebServerInfo.e2eCiBaseUrl,
            rootProject: options.rootProject,
        });
    }
    return e2eWebServerInfo.e2ePort;
}
function getAngularE2EWebServerInfo(tree, projectName, portOverride) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    let e2ePort = portOverride ?? 4200;
    const serveTargetOptions = (0, internal_1.readTargetDefaultsForTarget)('serve', nxJson.targetDefaults)?.options;
    if (serveTargetOptions?.port || serveTargetOptions?.env?.PORT) {
        e2ePort = serveTargetOptions.port || serveTargetOptions.env.PORT;
    }
    const pm = (0, devkit_1.getPackageManagerCommand)();
    return {
        e2eCiBaseUrl: `http://localhost:${e2ePort}`,
        e2eCiWebServerCommand: `${pm.exec} nx run ${projectName}:serve-static`,
        e2eWebServerCommand: `${pm.exec} nx run ${projectName}:serve`,
        e2eWebServerAddress: `http://localhost:${e2ePort}`,
        e2eDevServerTarget: `${projectName}:serve`,
        e2ePort,
    };
}
