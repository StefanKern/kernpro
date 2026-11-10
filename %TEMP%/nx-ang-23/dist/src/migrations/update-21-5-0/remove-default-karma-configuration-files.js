"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const targets_1 = require("../../utils/targets");
const karma_config_analyzer_1 = require("./utils/karma-config-analyzer");
const karma_config_comparer_1 = require("./utils/karma-config-comparer");
async function default_1(tree) {
    const removableKarmaConfigs = new Map();
    const projects = (0, devkit_1.getProjects)(tree);
    for (const [projectName, project] of projects) {
        for (const [, target] of (0, targets_1.allProjectTargets)(project)) {
            let needDevkitPlugin = false;
            switch (target.executor) {
                case '@angular-devkit/build-angular:karma':
                    needDevkitPlugin = true;
                    break;
                case '@angular/build:karma':
                    break;
                default:
                    continue;
            }
            for (const [, options] of (0, targets_1.allTargetOptions)(target)) {
                const karmaConfig = options['karmaConfig'];
                if (typeof karmaConfig !== 'string') {
                    continue;
                }
                let isRemovable = removableKarmaConfigs.get(karmaConfig);
                if (isRemovable === undefined && tree.exists(karmaConfig)) {
                    const content = tree.read(karmaConfig, 'utf-8');
                    const analysis = (0, karma_config_analyzer_1.analyzeKarmaConfig)(content);
                    if (analysis.hasUnsupportedValues) {
                        // Cannot safely determine if the file is removable.
                        isRemovable = false;
                    }
                    else {
                        const diff = await (0, karma_config_comparer_1.compareKarmaConfigToDefault)(analysis, projectName, karmaConfig, needDevkitPlugin);
                        isRemovable = !(0, karma_config_comparer_1.hasDifferences)(diff) && diff.isReliable;
                    }
                    removableKarmaConfigs.set(karmaConfig, isRemovable);
                    if (isRemovable) {
                        tree.delete(karmaConfig);
                    }
                }
                if (isRemovable) {
                    delete options['karmaConfig'];
                    (0, devkit_1.updateProjectConfiguration)(tree, projectName, project);
                }
            }
        }
    }
    await (0, devkit_1.formatFiles)(tree);
}
