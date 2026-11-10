"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.angularCliVersion = void 0;
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
exports.angularCliVersion = '~20.2.0';
async function default_1(tree) {
    const { devDependencies, dependencies } = (0, devkit_1.readJson)(tree, 'package.json');
    const hasAngularCli = devDependencies?.['@angular/cli'] || dependencies?.['@angular/cli'];
    if (hasAngularCli) {
        (0, devkit_1.addDependenciesToPackageJson)(tree, {}, { '@angular/cli': exports.angularCliVersion });
        await (0, devkit_1.formatFiles)(tree);
    }
}
