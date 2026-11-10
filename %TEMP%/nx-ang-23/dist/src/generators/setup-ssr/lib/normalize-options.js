"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const ast_utils_1 = require("../../../utils/nx-devkit/ast-utils");
async function normalizeOptions(tree, options) {
    const { targets, root } = (0, devkit_1.readProjectConfiguration)(tree, options.project);
    // Resolve the executor via targetDefaults: readProjectConfiguration returns
    // the raw config, so an inherited executor would otherwise read as undefined.
    const buildTargetExecutor = targets.build.executor ??
        (0, internal_1.readTargetDefaultsForTarget)('build', (0, devkit_1.readNxJson)(tree)?.targetDefaults)
            ?.executor;
    if (!buildTargetExecutor) {
        throw new Error(`The "build" target of the "${options.project}" project does not specify an executor. Please add an executor to the "build" target.`);
    }
    const isUsingApplicationBuilder = buildTargetExecutor === '@angular-devkit/build-angular:application' ||
        buildTargetExecutor === '@angular/build:application' ||
        buildTargetExecutor === '@nx/angular:application';
    const isUsingWebpackBuilder = buildTargetExecutor === '@nx/angular:webpack-browser';
    const isStandaloneApp = (0, ast_utils_1.isNgStandaloneApp)(tree, options.project);
    return {
        project: options.project,
        appId: options.appId ?? 'serverApp',
        main: options.main ?? 'main.server.ts',
        serverFileName: options.serverFileName ?? 'server.ts',
        serverPort: options.serverPort ?? 4000,
        rootModuleFileName: options.rootModuleFileName ?? 'app.server.module.ts',
        rootModuleClassName: options.rootModuleClassName ?? 'AppServerModule',
        skipFormat: options.skipFormat ?? false,
        standalone: options.standalone ?? isStandaloneApp,
        hydration: options.hydration ?? true,
        isUsingApplicationBuilder,
        isUsingWebpackBuilder,
        isRspack: options.isRspack ?? false,
        buildTargetExecutor,
        buildTargetTsConfigPath: targets.build.options?.tsConfig ??
            (0, devkit_1.joinPathFragments)(root, 'tsconfig.app.json'),
    };
}
