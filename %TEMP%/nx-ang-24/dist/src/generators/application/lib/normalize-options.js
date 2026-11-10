"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/js/internal");
const test_runners_1 = require("../../../utils/test-runners");
const version_utils_1 = require("../../utils/version-utils");
function validateBundler(bundler) {
    if (['esbuild', 'webpack', 'rspack'].includes(bundler)) {
        return bundler;
    }
    throw new Error(`Invalid bundler: ${bundler}. Please use one of the following: 'esbuild', 'webpack', 'rspack'.`);
}
async function normalizeOptions(host, options) {
    await (0, internal_1.ensureRootProjectName)(options, 'application');
    const { projectName: appProjectName, projectRoot: appProjectRoot } = await (0, internal_1.determineProjectNameAndRootOptions)(host, {
        name: options.name,
        projectType: 'application',
        directory: options.directory,
        rootProject: options.rootProject,
    });
    options.rootProject = appProjectRoot === '.';
    const e2eProjectName = options.rootProject ? 'e2e' : `${appProjectName}-e2e`;
    const e2eProjectRoot = options.rootProject ? 'e2e' : `${appProjectRoot}-e2e`;
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    const bundler = validateBundler(options.bundler ?? 'esbuild');
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(host);
    const zonelessDefaultValue = angularMajorVersion >= 21 ? true : false;
    const unitTestRunner = options.unitTestRunner ??
        (angularMajorVersion >= 21 && bundler === 'esbuild'
            ? test_runners_1.UnitTestRunner.VitestAngular
            : angularMajorVersion >= 21
                ? test_runners_1.UnitTestRunner.VitestAnalog
                : test_runners_1.UnitTestRunner.Jest);
    // Set defaults and then overwrite with user options
    return {
        style: 'css',
        routing: true,
        inlineStyle: false,
        inlineTemplate: false,
        skipTests: unitTestRunner === test_runners_1.UnitTestRunner.None,
        skipFormat: false,
        e2eTestRunner: test_runners_1.E2eTestRunner.Playwright,
        strict: true,
        standalone: true,
        directory: appProjectRoot,
        ...options,
        // Resolved after the spread, so the `=== 'none'` and `!== 'eslint'` guards
        // downstream see a concrete linter. Both read `undefined` as "some linter,
        // but not ESLint", which sets up linting and then skips its config.
        linter: await (0, internal_2.normalizeLinterOption)(host, options.linter),
        prefix: options.prefix || 'app',
        name: appProjectName,
        appProjectRoot,
        appProjectSourceRoot: `${appProjectRoot}/src`,
        e2eProjectRoot,
        e2eProjectName,
        parsedTags,
        bundler,
        outputPath: (0, devkit_1.joinPathFragments)('dist', !options.rootProject ? appProjectRoot : appProjectName),
        ssr: options.ssr ?? false,
        unitTestRunner,
        zoneless: options.zoneless ?? zonelessDefaultValue,
    };
}
