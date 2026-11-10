"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applicationGenerator = applicationGenerator;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const convert_to_rspack_1 = require("../convert-to-rspack/convert-to-rspack");
const init_1 = require("../init/init");
const setup_ssr_1 = require("../setup-ssr/setup-ssr");
const acknowledge_build_scripts_1 = require("../utils/acknowledge-build-scripts");
const ensure_angular_dependencies_1 = require("../utils/ensure-angular-dependencies");
const validations_1 = require("../utils/validations");
const version_utils_1 = require("../utils/version-utils");
const lib_1 = require("./lib");
async function applicationGenerator(tree, schema) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    (0, validations_1.assertNotUsingTsSolutionSetup)(tree, 'application');
    (0, lib_1.validateOptions)(tree, schema);
    const isRspack = schema.bundler === 'rspack';
    if (isRspack) {
        schema.bundler = 'webpack';
    }
    const options = await (0, lib_1.normalizeOptions)(tree, schema, isRspack);
    const rootOffset = (0, devkit_1.offsetFromRoot)(options.appProjectRoot);
    await (0, js_1.initGenerator)(tree, {
        ...options,
        tsConfigName: options.rootProject ? 'tsconfig.json' : 'tsconfig.base.json',
        js: false,
        skipFormat: true,
    });
    await (0, init_1.angularInitGenerator)(tree, {
        ...options,
        skipFormat: true,
        addPlugin: options.addPlugin,
    });
    if (!options.skipPackageJson) {
        (0, ensure_angular_dependencies_1.ensureAngularDependencies)(tree, options.zoneless);
    }
    (0, lib_1.createProject)(tree, options);
    await (0, lib_1.createFiles)(tree, options, rootOffset);
    await (0, lib_1.addLinting)(tree, options);
    const unitTestRunnerTask = await (0, lib_1.addUnitTestRunner)(tree, options);
    const e2ePort = await (0, lib_1.addE2e)(tree, options);
    (0, lib_1.addServeStaticTarget)(tree, options, options.e2eTestRunner !== 'none' ? e2ePort : options.port);
    (0, lib_1.updateTsconfigFiles)(tree, options);
    (0, lib_1.setGeneratorDefaults)(tree, options);
    if (options.rootProject) {
        const nxJson = (0, devkit_1.readNxJson)(tree);
        nxJson.defaultProject = options.name;
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
    if (options.backendProject) {
        (0, lib_1.addProxyConfig)(tree, options);
    }
    if (options.ssr) {
        await (0, setup_ssr_1.setupSsr)(tree, {
            project: options.name,
            standalone: options.standalone,
            skipPackageJson: options.skipPackageJson,
            isRspack,
        });
    }
    if (isRspack) {
        await (0, convert_to_rspack_1.convertToRspack)(tree, {
            project: options.name,
            skipInstall: options.skipPackageJson,
            skipFormat: true,
        });
    }
    if (!options.skipPackageJson) {
        const devDependencies = {};
        const packageVersions = (0, version_utils_1.versions)(tree);
        const angularDevkitVersion = (0, version_utils_1.getInstalledAngularDevkitVersion)(tree) ??
            packageVersions.angularDevkitVersion;
        if (options.bundler === 'esbuild') {
            devDependencies['@angular/build'] = angularDevkitVersion;
        }
        else if (isRspack) {
            devDependencies['@angular/build'] = angularDevkitVersion;
            devDependencies['@angular-devkit/build-angular'] = angularDevkitVersion;
        }
        else {
            devDependencies['@angular-devkit/build-angular'] = angularDevkitVersion;
        }
        if (options.style === 'less') {
            devDependencies['less'] = packageVersions.lessVersion;
            // less's postinstall only installs Playwright browsers, which nothing
            // that consumes less needs.
            (0, internal_1.acknowledgeBuildScripts)(tree, (0, devkit_1.detectPackageManager)(tree.root), {
                less: false,
            });
        }
        if (Object.keys(devDependencies).length) {
            (0, acknowledge_build_scripts_1.acknowledgeAngularBuildScripts)(tree);
            (0, devkit_1.addDependenciesToPackageJson)(tree, {}, devDependencies, undefined, true);
        }
    }
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    return async () => {
        await unitTestRunnerTask();
        (0, devkit_1.installPackagesTask)(tree);
        (0, internal_1.logShowProjectCommand)(options.name);
    };
}
exports.default = applicationGenerator;
