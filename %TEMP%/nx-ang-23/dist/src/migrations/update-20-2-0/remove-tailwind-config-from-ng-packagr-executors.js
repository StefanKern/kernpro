"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executors = void 0;
exports.default = default_1;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
exports.executors = ['@nx/angular:ng-packagr-lite', '@nx/angular:package'];
async function default_1(tree) {
    // update options from project configs
    exports.executors.forEach((executor) => {
        (0, internal_1.forEachExecutorOptions)(tree, executor, (options, project, target, configuration) => {
            if (options.tailwindConfig === undefined) {
                return;
            }
            const projectConfiguration = (0, devkit_1.readProjectConfiguration)(tree, project);
            if (configuration) {
                const config = projectConfiguration.targets[target].configurations[configuration];
                delete config.tailwindConfig;
                if (!Object.keys(config).length) {
                    delete projectConfiguration.targets[target].configurations[configuration];
                }
                if (!Object.keys(projectConfiguration.targets[target].configurations)
                    .length) {
                    delete projectConfiguration.targets[target].configurations;
                }
            }
            else {
                const config = projectConfiguration.targets[target].options;
                delete config.tailwindConfig;
                if (!Object.keys(config).length) {
                    delete projectConfiguration.targets[target].options;
                }
            }
            (0, devkit_1.updateProjectConfiguration)(tree, project, projectConfiguration);
        });
    });
    // update options from nx.json target defaults
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (!nxJson.targetDefaults) {
        return;
    }
    const cleanEntry = (targetConfig) => {
        if (targetConfig.options) {
            delete targetConfig.options.tailwindConfig;
            if (!Object.keys(targetConfig.options).length) {
                delete targetConfig.options;
            }
        }
        Object.entries(targetConfig.configurations ?? {}).forEach(([name, config]) => {
            delete config.tailwindConfig;
            if (!Object.keys(config).length) {
                delete targetConfig.configurations[name];
            }
        });
        if (!Object.keys(targetConfig.configurations ?? {}).length) {
            delete targetConfig.configurations;
        }
        return {
            empty: !Object.keys(targetConfig).length ||
                (Object.keys(targetConfig).length === 1 &&
                    Object.keys(targetConfig)[0] === 'executor'),
        };
    };
    for (const [targetOrExecutor, targetConfig] of Object.entries(nxJson.targetDefaults)) {
        if (Array.isArray(targetConfig)) {
            // This migration predates the filtered array value form; values are plain objects here.
            continue;
        }
        if (!exports.executors.includes(targetOrExecutor) &&
            !exports.executors.includes(targetConfig.executor)) {
            continue;
        }
        const { empty } = cleanEntry(targetConfig);
        if (empty) {
            delete nxJson.targetDefaults[targetOrExecutor];
        }
        if (!Object.keys(nxJson.targetDefaults).length) {
            delete nxJson.targetDefaults;
        }
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
    await (0, devkit_1.formatFiles)(tree);
}
