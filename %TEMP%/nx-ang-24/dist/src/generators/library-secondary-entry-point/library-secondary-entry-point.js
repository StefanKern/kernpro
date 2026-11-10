"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.librarySecondaryEntryPointGenerator = librarySecondaryEntryPointGenerator;
const devkit_1 = require("@nx/devkit");
const assert_supported_angular_version_1 = require("../../utils/assert-supported-angular-version");
const lib_1 = require("./lib");
async function librarySecondaryEntryPointGenerator(tree, rawOptions) {
    (0, assert_supported_angular_version_1.assertSupportedAngularVersion)(tree);
    const options = (0, lib_1.normalizeOptions)(tree, rawOptions);
    (0, lib_1.addFiles)(tree, options);
    (0, lib_1.addPathMapping)(tree, options);
    (0, lib_1.updateTsConfigIncludedFiles)(tree, options);
    if (!options.skipFormat) {
        await (0, devkit_1.formatFiles)(tree);
    }
}
exports.default = librarySecondaryEntryPointGenerator;
