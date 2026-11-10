"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomWebpackConfig = getCustomWebpackConfig;
const internal_1 = require("@nx/devkit/internal");
const path_1 = require("path");
const FILE_EXTENSION_REGEX = /\.[^.]+$/;
async function getCustomWebpackConfig(tree, projectRoot, pathToCustomWebpackConfig) {
    const configFile = await (0, internal_1.loadConfigFile)((0, path_1.join)(tree.root, pathToCustomWebpackConfig));
    const webpackConfig = 'default' in configFile ? configFile.default : configFile;
    return {
        isWebpackConfigFunction: typeof webpackConfig === 'function',
        normalizedPathToCustomWebpackConfig: `./${(0, path_1.relative)(projectRoot, pathToCustomWebpackConfig).replace(FILE_EXTENSION_REGEX, '')}`,
    };
}
