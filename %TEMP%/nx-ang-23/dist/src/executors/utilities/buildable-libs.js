"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTmpTsConfigForBuildableLibs = createTmpTsConfigForBuildableLibs;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const path_1 = require("path");
function createTmpTsConfigForBuildableLibs(tsConfigPath, context) {
    let dependencies;
    const result = (0, internal_1.calculateProjectDependencies)(context.projectGraph ?? (0, devkit_1.readCachedProjectGraph)(), context.root, context.projectName, context.targetName, context.configurationName);
    dependencies = result.dependencies;
    const tmpTsConfigPath = (0, internal_1.createTmpTsConfig)((0, path_1.join)(context.root, tsConfigPath), context.root, result.target.data.root, dependencies);
    process.env.NX_TSCONFIG_PATH = tmpTsConfigPath;
    const tmpTsConfigPathWithoutWorkspaceRoot = tmpTsConfigPath.replace(context.root, '');
    return { tsConfigPath: tmpTsConfigPathWithoutWorkspaceRoot, dependencies };
}
