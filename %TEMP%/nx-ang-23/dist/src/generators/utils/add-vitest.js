"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addVitestAngular = addVitestAngular;
exports.addVitestAnalog = addVitestAnalog;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const semver_1 = require("semver");
const versions_1 = require("../../utils/versions");
const acknowledge_build_scripts_1 = require("./acknowledge-build-scripts");
const version_utils_1 = require("./version-utils");
async function addVitestAngular(tree, options) {
    validateVitestVersion(tree);
    const executor = options.useNxUnitTestRunnerExecutor
        ? '@nx/angular:unit-test'
        : '@angular/build:unit-test';
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.name);
    project.targets ??= {};
    project.targets.test = { executor, options: { watch: false } };
    (0, devkit_1.updateProjectConfiguration)(tree, options.name, project);
    const nxJson = (0, devkit_1.readNxJson)(tree) ?? {};
    const existing = (0, internal_1.findTargetDefault)(nxJson.targetDefaults, { executor });
    if (!existing) {
        (0, internal_1.upsertTargetDefault)(tree, nxJson, {
            executor,
            cache: true,
            inputs: nxJson.namedInputs && 'production' in nxJson.namedInputs
                ? ['default', '^production']
                : ['default', '^default'],
        });
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
    configureTypeScriptForVitest(tree, options.projectRoot);
    addVitestScreenshotsToGitIgnore(tree);
    if (options.skipPackageJson) {
        return () => { };
    }
    const pkgVersions = (0, version_utils_1.versions)(tree, { minAngularMajorVersion: 21 });
    const angularDevkitVersion = (0, version_utils_1.getInstalledAngularDevkitVersion)(tree) ?? pkgVersions.angularDevkitVersion;
    (0, acknowledge_build_scripts_1.acknowledgeAngularBuildScripts)(tree);
    return (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
        '@angular/build': angularDevkitVersion,
        jsdom: pkgVersions.jsdomVersion,
        vitest: pkgVersions.vitestVersion,
    }, undefined, true);
}
async function addVitestAnalog(tree, options) {
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    const tasks = [];
    if (!options.skipPackageJson) {
        const angularDevkitVersion = (0, version_utils_1.getInstalledAngularDevkitVersion)(tree) ??
            (0, version_utils_1.versions)(tree).angularDevkitVersion;
        const devDependencies = {
            '@angular/build': angularDevkitVersion,
            // `@analogjs/vite-plugin-angular` (wired in by `@nx/vitest`'s
            // configurationGenerator for `uiFramework: 'angular'`) registers
            // an `angularVitestPlugin` whose `transform` hook downlevels
            // `@angular/*` fesm2022 modules via
            // `vite.transformWithOxc({ target: 'es2016', … })` so Zone.js
            // `fakeAsync` can intercept async/await. The lowered code emits
            // external `@oxc-project/runtime/helpers/*` imports (oxc default
            // `HelperMode = 'Runtime'`). Nothing in the upstream chain
            // (analogjs, @angular/core, vite, rolldown) declares the runtime
            // in a way that's resolvable from the consumer's workspace, so
            // it must be added here.
            '@oxc-project/runtime': versions_1.oxcProjectRuntimeVersion,
        };
        // Add compatible vitest/jsdom versions BEFORE calling configurationGenerator
        // so that @nx/vitest respects existing versions
        if (angularMajorVersion < 21) {
            const pkgVersions = (0, version_utils_1.versions)(tree);
            devDependencies['vitest'] = pkgVersions.vitestVersion;
            devDependencies['jsdom'] = pkgVersions.jsdomVersion;
        }
        (0, acknowledge_build_scripts_1.acknowledgeAngularBuildScripts)(tree);
        tasks.push((0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDependencies, undefined, true));
    }
    (0, devkit_1.ensurePackage)('@nx/vitest', versions_1.nxVersion);
    const { configurationGenerator, } = require('@nx/vitest/generators');
    tasks.push(await configurationGenerator(tree, {
        project: options.name,
        uiFramework: 'angular',
        testEnvironment: 'jsdom',
        coverageProvider: 'v8',
        addPlugin: options.addPlugin ?? false,
        skipFormat: options.skipFormat,
        skipPackageJson: options.skipPackageJson,
        zoneless: options.zoneless,
    }));
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
function validateVitestVersion(tree) {
    let installedVitestVersion = null;
    // Try to get the actual installed version from node_modules
    try {
        const { packageJson } = (0, internal_1.readModulePackageJson)('vitest');
        installedVitestVersion = packageJson.version;
    }
    catch { }
    const requiredRange = getVitestRangeAngularRequires(tree);
    if (installedVitestVersion) {
        if (!(0, semver_1.satisfies)(installedVitestVersion, requiredRange, {
            includePrerelease: true,
        })) {
            throw new Error(`The installed vitest version "${installedVitestVersion}" is not compatible with the version range Angular requires: "${requiredRange}".`);
        }
        return;
    }
    // not installed, get it from package.json
    installedVitestVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'vitest');
    if (!installedVitestVersion) {
        // not declared anywhere, it'll be installed with the correct version
        return;
    }
    if ((0, semver_1.valid)(installedVitestVersion)) {
        if (!(0, semver_1.satisfies)(installedVitestVersion, requiredRange, {
            includePrerelease: true,
        })) {
            throw new Error(`The installed vitest version "${installedVitestVersion}" is not compatible with the version range Angular requires: "${requiredRange}".`);
        }
    }
    else if ((0, semver_1.validRange)(installedVitestVersion)) {
        // it's a range from package.json, check if it intersects with the required range
        if (!(0, semver_1.intersects)(installedVitestVersion, requiredRange, {
            includePrerelease: true,
        })) {
            throw new Error(`The declared vitest version range "${installedVitestVersion}" does not overlap with the version range Angular requires: "${requiredRange}". When installed, this may cause compatibility issues.`);
        }
    }
    else {
        // it can be anything, we don't have a way to validate it
        // log a warning and continue
        devkit_1.logger.warn(`The declared vitest version "${installedVitestVersion}" is not a valid semver range, ` +
            `so we can't validate if it's compatible with the version range Angular requires: "${requiredRange}". ` +
            `The generation will continue, but you may encounter issues if the version is not compatible.`);
    }
}
// @angular/build 22.2.0 widened its vitest peer to `^4.0.8 || ^5.0.0`.
function getVitestRangeAngularRequires(tree) {
    const { vitestVersion } = (0, version_utils_1.versions)(tree, { minAngularMajorVersion: 21 });
    const vitestV5Range = '^5.0.0';
    let installedPeerRange;
    try {
        installedPeerRange =
            (0, internal_1.readModulePackageJson)('@angular/build').packageJson.peerDependencies
                ?.vitest;
    }
    catch { }
    const declaredAngularBuildVersion = (0, internal_1.getDeclaredPackageVersion)(tree, '@angular/build');
    const angularBuildPeersVitestV5 = (typeof installedPeerRange === 'string' &&
        (0, semver_1.validRange)(installedPeerRange) &&
        (0, semver_1.intersects)(installedPeerRange, vitestV5Range)) ||
        (!!declaredAngularBuildVersion &&
            (0, semver_1.gte)(declaredAngularBuildVersion, '22.2.0'));
    return angularBuildPeersVitestV5
        ? `${vitestVersion} || ${vitestV5Range}`
        : vitestVersion;
}
function configureTypeScriptForVitest(tree, projectRoot) {
    (0, devkit_1.writeJson)(tree, (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.spec.json'), {
        extends: './tsconfig.json',
        compilerOptions: {
            outDir: `${(0, devkit_1.offsetFromRoot)(projectRoot)}dist/out-tsc`,
            types: ['vitest/globals'],
        },
        include: ['src/**/*.ts', 'src/**/*.d.ts'],
    });
    const projectTsconfigPath = (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.json');
    (0, devkit_1.updateJson)(tree, projectTsconfigPath, (json) => {
        json.references ??= [];
        if (!json.references.some((ref) => ref.path === './tsconfig.spec.json')) {
            json.references.push({ path: './tsconfig.spec.json' });
        }
        return json;
    });
}
function addVitestScreenshotsToGitIgnore(tree) {
    if (tree.exists('.gitignore')) {
        let content = tree.read('.gitignore', 'utf-8');
        if (/^__screenshots__\/$/gm.test(content)) {
            return;
        }
        content = `${content}\n__screenshots__/\n`;
        tree.write('.gitignore', content);
    }
    else {
        devkit_1.logger.warn(`Couldn't find .gitignore file to update`);
    }
}
