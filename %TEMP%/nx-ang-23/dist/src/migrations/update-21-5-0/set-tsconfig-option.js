"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const targets_1 = require("../../utils/targets");
const projects_1 = require("../utils/projects");
const buildExecutors = new Set([
    '@nx/angular:ng-packagr-lite',
    '@nx/angular:package',
]);
const testExecutors = new Set(['@nx/jest:jest']);
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/core',
    ]);
    for (const project of projects) {
        try {
            // we're only updating static project configurations, not inferred ones
            const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, project.name);
            let wasUpdated = false;
            for (const target of relevantTargets(projectConfig)) {
                updateTarget(tree, projectConfig, target);
                wasUpdated = true;
            }
            if (wasUpdated) {
                (0, devkit_1.updateProjectConfiguration)(tree, project.name, projectConfig);
            }
        }
        catch {
            // ignore, it can happen if the project is fully inferred and there's no
            // `project.json` file or `nx` entry in `package.json`
        }
    }
    await (0, devkit_1.formatFiles)(tree);
}
function updateTarget(tree, projectConfig, target) {
    if (buildExecutors.has(target.executor)) {
        if (target.configurations?.['development']?.tsConfig) {
            // only set the option if the target has the expected tsConfig option in
            // the development configuration
            target.options ??= {};
            target.options.tsConfig = target.configurations['development'].tsConfig;
            // remove tsConfig from development configuration after moving it to options
            delete target.configurations['development'].tsConfig;
        }
    }
    else if (testExecutors.has(target.executor)) {
        const expectedTsconfigPath = (0, devkit_1.joinPathFragments)(projectConfig.root, 'tsconfig.spec.json');
        if (tree.exists(expectedTsconfigPath)) {
            // we keep it simple and only set the option if the expected tsconfig
            // file exists
            target.options ??= {};
            target.options.tsConfig = expectedTsconfigPath;
        }
    }
}
function* relevantTargets(project) {
    for (const [, target] of (0, targets_1.allProjectTargets)(project)) {
        if (!buildExecutors.has(target.executor) &&
            !testExecutors.has(target.executor)) {
            continue;
        }
        if (!target.options?.['tsConfig']) {
            yield target;
        }
    }
}
