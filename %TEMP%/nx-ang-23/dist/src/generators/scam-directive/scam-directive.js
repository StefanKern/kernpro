"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scamDirectiveGenerator = scamDirectiveGenerator;
const devkit_1 = require("@nx/devkit");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const directive_1 = require("../directive/directive");
const export_scam_1 = require("../utils/export-scam");
const lib_1 = require("./lib");
/**
 * @deprecated SCAMs are superseded by Angular standalone components. Use the `directiveGenerator` instead. It will be removed in Nx v24.
 */
async function scamDirectiveGenerator(tree, rawOptions) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    const options = await (0, lib_1.normalizeOptions)(tree, rawOptions);
    await (0, directive_1.directiveGenerator)(tree, {
        ...options,
        skipImport: true,
        export: false,
        standalone: false,
        skipFormat: true,
    });
    (0, lib_1.convertDirectiveToScam)(tree, options);
    (0, export_scam_1.exportScam)(tree, options);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
}
exports.default = scamDirectiveGenerator;
