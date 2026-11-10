"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.federateModuleGenerator = federateModuleGenerator;
const devkit_1 = require("@nx/devkit");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const test_runners_1 = require("../../utils/test-runners");
const version_utils_1 = require("../utils/version-utils");
const lib_1 = require("./lib");
async function federateModuleGenerator(tree, schema) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    if (!tree.exists(schema.path)) {
        throw new Error((0, devkit_1.stripIndents) `The "path" provided  does not exist. Please verify the path is correct and pointing to a file that exists in the workspace.
    
    Path: ${schema.path}`);
    }
    schema.standalone = schema.standalone ?? true;
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    // federate-module uses webpack/rspack bundlers, so vitest-angular is not available
    schema.unitTestRunner ??=
        angularMajorVersion >= 21
            ? test_runners_1.UnitTestRunner.VitestAnalog
            : test_runners_1.UnitTestRunner.Jest;
    const { tasks, projectRoot, remoteName } = await (0, lib_1.addRemote)(tree, schema);
    (0, lib_1.addFileToRemoteTsconfig)(tree, remoteName, schema.path);
    (0, lib_1.addPathToExposes)(tree, {
        projectPath: projectRoot,
        modulePath: schema.path,
        moduleName: schema.name,
    });
    (0, lib_1.addPathToTsConfig)(tree, {
        remoteName,
        moduleName: schema.name,
        pathToFile: schema.path,
    });
    if (!schema.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
    devkit_1.logger.info(`✅️ Updated module federation config.
    Now you can use the module from your remote app like this:

    Static import:
    import { MyComponent } from '${remoteName}/${schema.name}';
    
    Dynamic import:
    import('${remoteName}/${schema.name}').then((m) => m.MyComponent);
  `);
    return (0, devkit_1.runTasksInSerial)(...tasks);
}
exports.default = federateModuleGenerator;
