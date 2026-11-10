"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCustomWebpackConfig = getCustomWebpackConfig;
exports.convertWebpackConfigToUseNxModuleFederationPlugin = convertWebpackConfigToUseNxModuleFederationPlugin;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const path_1 = require("path");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const FILE_EXTENSION_REGEX = /\.[^.]+$/;
async function getCustomWebpackConfig(tree, projectRoot, pathToCustomWebpackConfig) {
    const webpackConfigContents = tree.read(pathToCustomWebpackConfig, 'utf-8');
    if (webpackConfigContents.includes('@nx/module-federation/angular') &&
        webpackConfigContents.includes('withModuleFederation')) {
        tree.write(pathToCustomWebpackConfig, convertWebpackConfigToUseNxModuleFederationPlugin(webpackConfigContents));
        return {
            isWebpackConfigFunction: false,
            normalizedPathToCustomWebpackConfig: `./${(0, path_1.relative)(projectRoot, pathToCustomWebpackConfig).replace(FILE_EXTENSION_REGEX, '')}`,
        };
    }
    const configFile = await (0, internal_1.loadConfigFile)((0, path_1.join)(tree.root, pathToCustomWebpackConfig));
    const webpackConfig = 'default' in configFile ? configFile.default : configFile;
    return {
        isWebpackConfigFunction: typeof webpackConfig === 'function',
        normalizedPathToCustomWebpackConfig: `./${(0, path_1.relative)(projectRoot, pathToCustomWebpackConfig).replace(FILE_EXTENSION_REGEX, '')}`,
    };
}
function convertWebpackConfigToUseNxModuleFederationPlugin(webpackConfigContents) {
    let newWebpackConfigContents = webpackConfigContents;
    let sourceFile = (0, tsquery_1.ast)(webpackConfigContents);
    const withModuleFederationImportNodes = (0, tsquery_1.query)(sourceFile, 'ImportDeclaration:has(StringLiteral[value=@nx/module-federation/angular])');
    if (withModuleFederationImportNodes.length > 0) {
        const withModuleFederationImportNode = withModuleFederationImportNodes[0];
        newWebpackConfigContents = `${webpackConfigContents.slice(0, withModuleFederationImportNode.getStart())}import { NxModuleFederationPlugin, NxModuleFederationDevServerPlugin } from '@nx/module-federation/angular';${webpackConfigContents.slice(withModuleFederationImportNode.getEnd())}`;
        sourceFile = (0, tsquery_1.ast)(newWebpackConfigContents);
        const exportedWithModuleFederationNodes = (0, tsquery_1.query)(sourceFile, 'ExportAssignment:has(CallExpression > Identifier[name=withModuleFederation])');
        if (exportedWithModuleFederationNodes.length > 0) {
            const exportedWithModuleFederationNode = exportedWithModuleFederationNodes[0];
            newWebpackConfigContents = `${newWebpackConfigContents.slice(0, exportedWithModuleFederationNode.getStart())}${newWebpackConfigContents.slice(exportedWithModuleFederationNode.getEnd())}
    export default {
      plugins: [
        new NxModuleFederationPlugin({ config }, {
          dts: false,
        }),
        new NxModuleFederationDevServerPlugin({ config }),
      ]
    }
    `;
        }
        else {
            devkit_1.logger.warn("Could not find 'export default withModuleFederation' in the webpack config file. Skipping conversion.");
        }
    }
    const withModuleFederationRequireNodes = (0, tsquery_1.query)(sourceFile, 'VariableStatement:has(CallExpression > Identifier[name=withModuleFederation], StringLiteral[value=@nx/module-federation/angular])');
    if (withModuleFederationRequireNodes.length > 0) {
        const withModuleFederationRequireNode = withModuleFederationRequireNodes[0];
        newWebpackConfigContents = `${webpackConfigContents.slice(0, withModuleFederationRequireNode.getStart())}const { NxModuleFederationPlugin, NxModuleFederationDevServerPlugin } = require('@nx/module-federation/rspack');${webpackConfigContents.slice(withModuleFederationRequireNode.getEnd())}`;
        sourceFile = (0, tsquery_1.ast)(newWebpackConfigContents);
        const exportedWithModuleFederationNodes = (0, tsquery_1.query)(sourceFile, 'ExpressionStatement:has(BinaryExpression > PropertyAccessExpression:has(Identifier[name=module], Identifier[name=exports]), CallExpression:has(Identifier[name=withModuleFederation]))');
        if (exportedWithModuleFederationNodes.length > 0) {
            const exportedWithModuleFederationNode = exportedWithModuleFederationNodes[0];
            newWebpackConfigContents = `${newWebpackConfigContents.slice(0, exportedWithModuleFederationNode.getStart())}${newWebpackConfigContents.slice(exportedWithModuleFederationNode.getEnd())}
    module.exports = {
      plugins: [
        new NxModuleFederationPlugin({ config }, {
          dts: false,
        }),
        new NxModuleFederationDevServerPlugin({ config }),
      ]
    }
    `;
        }
        else {
            devkit_1.logger.warn("Could not find 'module.exports = withModuleFederation' in the webpack config file. Skipping conversion.");
        }
    }
    return newWebpackConfigContents;
}
