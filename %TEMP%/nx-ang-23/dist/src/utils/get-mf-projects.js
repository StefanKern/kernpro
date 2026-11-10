"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMFProjects = getMFProjects;
const internal_1 = require("@nx/devkit/internal");
function _getMfProjects(tree, CUSTOM_WEBPACK_OPTION, MODULE_FEDERATION_IDENTIFIER, projects) {
    return (opts, projectName) => {
        const webpackPath = opts[CUSTOM_WEBPACK_OPTION]?.path;
        if (!webpackPath || !tree.exists(webpackPath)) {
            return;
        }
        const webpackConfig = tree.read(webpackPath, 'utf-8');
        const { ast, query } = require('@phenomnomnominal/tsquery');
        const sourceFile = ast(webpackConfig);
        const moduleFederationWebpackConfig = query(sourceFile, MODULE_FEDERATION_IDENTIFIER);
        if (!moduleFederationWebpackConfig ||
            moduleFederationWebpackConfig.length === 0) {
            return;
        }
        projects.push(projectName);
    };
}
function getMFProjects(tree, { legacy } = { legacy: false }) {
    const CUSTOM_WEBPACK_OPTION = 'customWebpackConfig';
    const MODULE_FEDERATION_IDENTIFIER = legacy
        ? 'Identifier[name=ModuleFederationPlugin]'
        : 'Identifier[name=withModuleFederation]';
    const projects = [];
    (0, internal_1.forEachExecutorOptions)(tree, '@nx/angular:webpack-browser', _getMfProjects(tree, CUSTOM_WEBPACK_OPTION, MODULE_FEDERATION_IDENTIFIER, projects));
    (0, internal_1.forEachExecutorOptions)(tree, '@nrwl/angular:webpack-browser', _getMfProjects(tree, CUSTOM_WEBPACK_OPTION, MODULE_FEDERATION_IDENTIFIER, projects));
    return projects;
}
