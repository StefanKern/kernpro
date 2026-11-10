"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rulesToRemove = void 0;
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/eslint/internal");
const projects_1 = require("../utils/projects");
exports.rulesToRemove = [
    '@angular-eslint/no-host-metadata-property',
    '@angular-eslint/sort-ngmodule-metadata-arrays',
    '@angular-eslint/prefer-standalone-component',
];
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/core',
    ]);
    let hasRootProject = false;
    for (const graphNode of projects) {
        const root = graphNode.data.root;
        if (!(0, internal_1.isEslintConfigSupported)(tree, root)) {
            // ESLint config is not supported, skip
            continue;
        }
        if (root === '.') {
            hasRootProject = true;
        }
        removeRules(tree, root);
    }
    /**
     * We need to handle both a root config file (e.g. eslint.config.js) and a
     * potential base config file (e.g. eslint.base.config.js). We can't use
     * `findEslintFile` because it would return only one or the other depending
     * on whether a root is provided and the existence of the files. So, we
     * handle each of them separately.
     */
    // check root config, provide a root so it doesn't try to lookup a base config
    if (!hasRootProject) {
        // if there is no root project the root eslint config has not been processed
        if ((0, internal_1.isEslintConfigSupported)(tree, '')) {
            removeRules(tree, '');
        }
    }
    // handle root base config, not providing a root will prioritize a base config
    const baseEslintConfig = (0, internal_1.findEslintFile)(tree);
    if (baseEslintConfig && baseEslintConfig.includes('.base.')) {
        removeRules(tree, baseEslintConfig);
    }
    await (0, devkit_1.formatFiles)(tree);
}
function removeRules(tree, root) {
    for (const rule of exports.rulesToRemove) {
        const lookup = (o) => !!o.rules?.[rule];
        if (!(0, internal_1.lintConfigHasOverride)(tree, root, lookup)) {
            // it's not using the rule, skip
            continue;
        }
        // there is an override containing the rule, remove the rule
        (0, internal_1.updateOverrideInLintConfig)(tree, root, lookup, (o) => {
            delete o.rules[rule];
            return o;
        });
    }
}
