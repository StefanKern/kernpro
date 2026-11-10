"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delegateBuildExecutor = delegateBuildExecutor;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
async function* delegateBuildExecutor(options, context) {
    const { target, dependencies } = (0, internal_1.calculateProjectBuildableDependencies)(context.taskGraph, context.projectGraph, context.root, context.projectName, context.targetName, context.configurationName);
    options.tsConfig = (0, internal_1.createTmpTsConfig)((0, devkit_1.joinPathFragments)(context.root, options.tsConfig), context.root, target.data.root, dependencies);
    const { buildTarget, ...targetOptions } = options;
    const delegateTarget = (0, devkit_1.parseTargetString)(buildTarget, context);
    yield* await (0, devkit_1.runExecutor)(delegateTarget, targetOptions, context);
}
exports.default = delegateBuildExecutor;
