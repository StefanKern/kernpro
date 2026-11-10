"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = update;
const internal_1 = require("@nx/devkit/internal");
async function update(tree) {
    return (0, internal_1.addReadyWhenSignalToTargets)(tree, [
        '@angular/build:dev-server',
        '@angular-devkit/build-angular:dev-server',
        '@angular-devkit/build-angular:ssr-dev-server',
        '@nx/angular:dev-server',
    ]);
}
