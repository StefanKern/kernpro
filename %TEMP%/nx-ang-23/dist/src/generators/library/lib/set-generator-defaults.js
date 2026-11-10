"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setGeneratorDefaults = setGeneratorDefaults;
const devkit_1 = require("@nx/devkit");
function setGeneratorDefaults(tree, options) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    nxJson.generators = nxJson.generators ?? {};
    nxJson.generators['@nx/angular:library'] = {
        // Pinning `none` would freeze the answer detection exists to give, so a
        // workspace that adopts a linter later would keep getting none.
        linter: options.libraryOptions.linter === 'none'
            ? undefined
            : options.libraryOptions.linter,
        unitTestRunner: options.libraryOptions.unitTestRunner,
        strict: !options.libraryOptions.strict ? false : undefined,
        ...(nxJson.generators['@nx/angular:library'] || {}),
    };
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
