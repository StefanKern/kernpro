"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ensureMfPackage;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const versions_1 = require("../../utils/versions");
async function ensureMfPackage(tree) {
    const projects = new Set();
    (0, internal_1.forEachExecutorOptions)(tree, '@nx/angular:module-federation-dev-server', (options, project, target) => {
        const projectConfig = (0, devkit_1.readProjectConfiguration)(tree, project);
        projects.add(projectConfig.root);
    });
    if (projects.size !== 0) {
        (0, devkit_1.addDependenciesToPackageJson)(tree, {}, {
            '@nx/module-federation': versions_1.nxVersion,
        });
    }
}
