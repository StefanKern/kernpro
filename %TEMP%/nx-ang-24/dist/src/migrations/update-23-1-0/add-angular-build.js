"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const acknowledge_build_scripts_1 = require("../../generators/utils/acknowledge-build-scripts");
const version_utils_1 = require("../../generators/utils/version-utils");
// The `@nx/angular:application` and `@nx/angular:unit-test` executors import
// `@angular/build` directly to run the Angular builders, and any
// `@angular/build:*` executor is provided by that package; it is a required
// runtime dependency for these targets. Nothing declares it as a direct
// dependency, though: it has only ever been pulled in transitively via
// `@angular-devkit/build-angular`, which isn't reliable (it can be absent from
// node_modules, e.g. under Yarn Berry), so `require.resolve('@angular/build')`
// fails and the build breaks. Add it as a direct dependency when an executor
// needs it. Match the version `@angular-devkit/build-angular` pins it to,
// because a newer `@angular/build` breaks peers such as `@angular/ssr`.
const angularBuildExecutors = [
    '@nx/angular:application',
    '@nx/angular:unit-test',
];
function usesAngularBuild(executors) {
    return executors.some((e) => e != null &&
        (angularBuildExecutors.includes(e) || e.startsWith('@angular/build:')));
}
async function default_1(tree) {
    // Already a direct dependency -> nothing to add.
    const { dependencies, devDependencies } = (0, devkit_1.readJson)(tree, 'package.json');
    if (dependencies?.['@angular/build'] || devDependencies?.['@angular/build']) {
        return;
    }
    let needsAngularBuild = false;
    // project.json targets
    for (const [, project] of (0, devkit_1.getProjects)(tree)) {
        needsAngularBuild = Object.values(project.targets ?? {}).some((target) => usesAngularBuild([target.executor]));
        if (needsAngularBuild) {
            break;
        }
    }
    // nx.json targetDefaults (keyed by target name or executor): a project's empty
    // target can inherit the executor from a default.
    if (!needsAngularBuild) {
        const targetDefaults = (0, devkit_1.readNxJson)(tree)?.targetDefaults;
        if (targetDefaults) {
            needsAngularBuild = Object.entries(targetDefaults).some(([targetOrExecutor, config]) => 
            // Mirror `add-istanbul-instrumenter`: the filtered array value form is
            // out of scope; only plain object defaults carry an inheritable executor.
            !Array.isArray(config) &&
                usesAngularBuild([targetOrExecutor, config.executor]));
        }
    }
    if (!needsAngularBuild) {
        return;
    }
    (0, acknowledge_build_scripts_1.acknowledgeAngularBuildScripts)(tree);
    const version = (0, internal_1.getInstalledPackageVersionFromTree)(tree, '@angular-devkit/build-angular') ??
        (0, version_utils_1.getInstalledAngularVersion)(tree);
    return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@angular/build': `~${version}` }, undefined, true);
}
