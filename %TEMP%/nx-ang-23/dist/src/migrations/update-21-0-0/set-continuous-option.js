"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.continuousExecutors = void 0;
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
exports.continuousExecutors = new Set([
    '@angular-devkit/build-angular:dev-server',
    '@angular-devkit/build-angular:ssr-dev-server',
    '@nx/angular:dev-server',
    '@nx/angular:module-federation-dev-server',
    '@nx/angular:module-federation-dev-ssr',
]);
async function default_1(tree) {
    const projects = (0, devkit_1.getProjects)(tree);
    for (const [projectName, projectConfig] of projects) {
        let updated = false;
        for (const targetConfig of Object.values(projectConfig.targets ?? {})) {
            if (exports.continuousExecutors.has(targetConfig.executor) &&
                targetConfig.continuous === undefined) {
                targetConfig.continuous = true;
                updated = true;
            }
        }
        if (updated) {
            (0, devkit_1.updateProjectConfiguration)(tree, projectName, projectConfig);
        }
    }
    await (0, devkit_1.formatFiles)(tree);
}
