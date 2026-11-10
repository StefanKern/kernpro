"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const targets_1 = require("../../utils/targets");
// Application builders whose SSR `experimentalPlatform` option Angular v22
// renamed to `platform`. This mirrors Angular's `update-workspace-config`
// migration (which targets the upstream `@angular/build:application` and
// `@angular-devkit/build-angular:application` builders) and additionally covers
// the `@nx/angular:application` executor that wraps them, since Nx does not run
// Angular's own ng-update migrations.
const ssrApplicationExecutors = [
    '@angular/build:application',
    '@angular-devkit/build-angular:application',
    '@nx/angular:application',
];
function renameSsrPlatform(target) {
    let isUpdated = false;
    for (const [, options] of (0, targets_1.allTargetOptions)(target)) {
        const ssr = options.ssr;
        if (!ssr || typeof ssr !== 'object') {
            continue;
        }
        const platform = ssr.experimentalPlatform;
        if (platform) {
            ssr.platform = platform;
            delete ssr.experimentalPlatform;
            isUpdated = true;
        }
    }
    return isUpdated;
}
async function default_1(tree) {
    // project.json target options and configurations
    for (const [projectName, project] of (0, devkit_1.getProjects)(tree)) {
        if (project.projectType !== 'application') {
            continue;
        }
        let isUpdated = false;
        for (const target of Object.values(project.targets ?? {})) {
            if (!ssrApplicationExecutors.includes(target.executor)) {
                continue;
            }
            if (renameSsrPlatform(target)) {
                isUpdated = true;
            }
        }
        if (isUpdated) {
            (0, devkit_1.updateProjectConfiguration)(tree, projectName, project);
        }
    }
    // nx.json targetDefaults (keyed by target name or executor)
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (nxJson?.targetDefaults) {
        let isUpdated = false;
        for (const [targetOrExecutor, targetConfig] of Object.entries(nxJson.targetDefaults)) {
            // This migration predates the filtered array value form; values are
            // plain objects here.
            if (Array.isArray(targetConfig)) {
                continue;
            }
            if (!ssrApplicationExecutors.includes(targetOrExecutor) &&
                !ssrApplicationExecutors.includes(targetConfig.executor)) {
                continue;
            }
            if (renameSsrPlatform(targetConfig)) {
                isUpdated = true;
            }
        }
        if (isUpdated) {
            (0, devkit_1.updateNxJson)(tree, nxJson);
        }
    }
    await (0, devkit_1.formatFiles)(tree);
}
