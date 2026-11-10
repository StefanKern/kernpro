"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngAddGenerator = ngAddGenerator;
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const migrate_from_angular_cli_1 = require("./migrate-from-angular-cli");
async function ngAddGenerator(tree, options) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    return await (0, migrate_from_angular_cli_1.migrateFromAngularCli)(tree, options);
}
exports.default = ngAddGenerator;
