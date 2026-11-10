"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const tsconfig_utils_1 = require("../../generators/utils/tsconfig-utils");
const targets_1 = require("../../utils/targets");
const projects_1 = require("../utils/projects");
async function default_1(tree) {
    const uniqueSpecTsConfigs = new Set();
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/core',
        'npm:jest-preset-angular',
    ]);
    for (const graphNode of projects) {
        const projectRoot = graphNode.data.root;
        // add tsconfig.spec.json if it exists
        const specTsConfigPath = (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.spec.json');
        if (tree.exists(specTsConfigPath)) {
            uniqueSpecTsConfigs.add(specTsConfigPath);
        }
        // look for tsConfig in @nx/jest:jest tasks in case there are any
        // custom test tsconfig files
        for (const [, target] of (0, targets_1.allProjectTargets)(graphNode.data)) {
            if (target.executor !== '@nx/jest:jest') {
                continue;
            }
            for (const [, options] of (0, targets_1.allTargetOptions)(target)) {
                if (typeof options?.tsConfig === 'string' &&
                    tree.exists(options.tsConfig)) {
                    uniqueSpecTsConfigs.add(options.tsConfig);
                }
            }
        }
    }
    for (const tsConfig of uniqueSpecTsConfigs) {
        setIsolatedModules(tree, tsConfig);
    }
    await (0, devkit_1.formatFiles)(tree);
}
function setIsolatedModules(tree, tsConfigPath) {
    const compilerOptions = (0, tsconfig_utils_1.readCompilerOptionsFromTsConfig)(tree, tsConfigPath);
    if (compilerOptions.isolatedModules === true) {
        // already set to true
        return;
    }
    // set isolatedModules to true
    (0, devkit_1.updateJson)(tree, tsConfigPath, (json) => {
        json.compilerOptions ??= {};
        json.compilerOptions.isolatedModules = true;
        return json;
    });
}
