"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addJest = addJest;
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
const version_utils_1 = require("./version-utils");
async function addJest(tree, options) {
    if (!options.skipPackageJson) {
        const pkgVersions = (0, version_utils_1.versions)(tree);
        const devDependencies = {
            'jest-preset-angular': pkgVersions.jestPresetAngularVersion,
        };
        const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
        if (angularMajorVersion < 21) {
            // force jest v29.7.0
            devDependencies.jest = '^29.7.0';
        }
        (0, devkit_1.addDependenciesToPackageJson)(tree, {
            // TODO(leo): jest-preset-angular still needs this, it has it as a peer dependency
            '@angular/platform-browser-dynamic': pkgVersions.angularVersion,
        }, devDependencies, undefined, true);
    }
    const { configurationGenerator } = (0, devkit_1.ensurePackage)('@nx/jest', versions_1.nxVersion);
    await configurationGenerator(tree, {
        project: options.name,
        setupFile: 'angular',
        supportTsx: false,
        skipSerializers: false,
        skipPackageJson: options.skipPackageJson,
        skipFormat: true,
        addPlugin: options.addPlugin ?? false,
        addExplicitTargets: !options.addPlugin,
    });
    const setupFile = (0, devkit_1.joinPathFragments)(options.projectRoot, 'src', 'test-setup.ts');
    if (options.zoneless) {
        tree.write(setupFile, getZonelessSetupFile(options.strict));
    }
    else {
        tree.write(setupFile, getZoneSetupFile(options.strict));
    }
    const runtimeTsconfigPath = (0, devkit_1.joinPathFragments)(options.projectRoot, options.runtimeTsconfigFileName);
    if (tree.exists(runtimeTsconfigPath)) {
        (0, devkit_1.updateJson)(tree, runtimeTsconfigPath, (json) => {
            const excludeSet = new Set([
                ...(json.exclude ?? []),
                'src/test-setup.ts',
            ]);
            json.exclude = Array.from(excludeSet);
            return json;
        });
    }
}
const strictTestEnvOptions = `{
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true
}`;
function getZonelessSetupFile(strict) {
    return `import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv(${strict ? strictTestEnvOptions : ''});
`;
}
function getZoneSetupFile(strict) {
    return `import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv(${strict ? strictTestEnvOptions : ''});
`;
}
