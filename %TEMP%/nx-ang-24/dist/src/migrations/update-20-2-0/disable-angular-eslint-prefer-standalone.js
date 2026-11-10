"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/eslint/internal");
const projects_1 = require("../utils/projects");
const preferStandaloneRule = '@angular-eslint/prefer-standalone';
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/core',
    ]);
    for (const graphNode of projects) {
        const root = graphNode.data.root;
        if (!(0, internal_1.isEslintConfigSupported)(tree, root)) {
            // ESLint config is not supported, skip
            continue;
        }
        if ((0, internal_1.lintConfigHasOverride)(tree, root, (o) => !!o.rules?.[preferStandaloneRule], true)) {
            // the @angular-eslint/prefer-standalone rule is set in an override, skip
            continue;
        }
        const ngEslintOverrideLookup = (o) => o.files?.includes('*.ts') &&
            Object.keys(o.rules ?? {}).some((r) => r.startsWith('@angular-eslint/'));
        const tsFilesOverrideLookup = (o) => o.files?.length === 1 && o.files[0] === '*.ts';
        if ((0, internal_1.lintConfigHasOverride)(tree, root, ngEslintOverrideLookup, false)) {
            // there is an override containing an Angular ESLint rule
            (0, internal_1.updateOverrideInLintConfig)(tree, root, ngEslintOverrideLookup, (o) => {
                o.rules = {
                    ...o.rules,
                    [preferStandaloneRule]: 'off',
                };
                return o;
            });
        }
        else if ((0, internal_1.lintConfigHasOverride)(tree, root, tsFilesOverrideLookup, false)) {
            // there is an override for just *.ts files
            (0, internal_1.updateOverrideInLintConfig)(tree, root, tsFilesOverrideLookup, (o) => {
                o.rules = {
                    ...o.rules,
                    [preferStandaloneRule]: 'off',
                };
                return o;
            });
        }
        else {
            // there are no overrides for any Angular ESLint rule or just *.ts files, add a new override
            (0, internal_1.addOverrideToLintConfig)(tree, root, {
                files: ['*.ts'],
                rules: {
                    [preferStandaloneRule]: 'off',
                },
            });
        }
    }
    await (0, devkit_1.formatFiles)(tree);
}
