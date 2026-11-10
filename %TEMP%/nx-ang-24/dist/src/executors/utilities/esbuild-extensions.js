"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadPlugins = loadPlugins;
exports.loadMiddleware = loadMiddleware;
exports.loadIndexHtmlTransformer = loadIndexHtmlTransformer;
const devkit_1 = require("@nx/devkit");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const module_loader_1 = require("./module-loader");
// Nx strips {workspaceRoot}/ and expands {projectRoot} in option paths to a
// path relative to the workspace root, but require() would resolve that against
// this file's directory. Anchor it to the workspace root, while leaving bare
// package specifiers (e.g. an esbuild plugin shipped as a package) untouched.
function resolveModulePath(path) {
    if ((0, node_path_1.isAbsolute)(path)) {
        return path;
    }
    const candidate = (0, node_path_1.join)(devkit_1.workspaceRoot, path);
    return (0, node_fs_1.existsSync)(candidate) ? candidate : path;
}
async function loadPlugins(plugins, tsConfig) {
    if (!plugins?.length) {
        return [];
    }
    return Promise.all(plugins.map((plugin) => loadPlugin(plugin, tsConfig)));
}
async function loadPlugin(pluginSpec, tsConfig) {
    const pluginPath = typeof pluginSpec === 'string' ? pluginSpec : pluginSpec.path;
    let plugin = await (0, module_loader_1.loadModule)(resolveModulePath(pluginPath), tsConfig);
    if (typeof plugin === 'function') {
        plugin =
            typeof pluginSpec === 'object' ? plugin(pluginSpec.options) : plugin();
    }
    return plugin;
}
async function loadMiddleware(middlewareFns, tsConfig) {
    if (!middlewareFns?.length) {
        return [];
    }
    return Promise.all(middlewareFns.map((fnPath) => (0, module_loader_1.loadModule)(resolveModulePath(fnPath), tsConfig)));
}
async function loadIndexHtmlTransformer(indexHtmlTransformerPath, tsConfig) {
    return (0, module_loader_1.loadModule)(resolveModulePath(indexHtmlTransformerPath), tsConfig);
}
