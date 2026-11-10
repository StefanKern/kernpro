"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConfig = createConfig;
const devkit_1 = require("@nx/devkit");
function createConfig(tree, opts, configurationOptions = {}, existingWebpackConfigPath, isExistingWebpackConfigFunction) {
    const { root, ...createConfigOptions } = opts;
    const hasConfigurations = Object.keys(configurationOptions).length > 0;
    const expandedConfigurationOptions = hasConfigurations
        ? Object.entries(configurationOptions)
            .map(([configurationName, configurationOptions]) => {
            return `
      "${configurationName}": {
        options: {
          ${JSON.stringify(configurationOptions, undefined, 2).slice(1, -1)}
        }
      }`;
        })
            .join(',\n')
        : '';
    const createConfigContents = `createConfig({
    options: {
      root: __dirname,
      ${JSON.stringify(createConfigOptions, undefined, 2).slice(1, -1)}
    }
  }${hasConfigurations ? `, {${expandedConfigurationOptions}}` : ''});`;
    const configContents = `
  import { createConfig }from '@nx/angular-rspack';
  ${existingWebpackConfigPath
        ? `import baseWebpackConfig from '${existingWebpackConfigPath}';
      ${isExistingWebpackConfigFunction
            ? ''
            : `import webpackMerge from 'webpack-merge';`}`
        : ''}
  
  ${existingWebpackConfigPath
        ? `export default async () => {
        const baseConfig = await ${createConfigContents}
        ${isExistingWebpackConfigFunction
            ? `const oldConfig = await baseWebpackConfig;
        const browserConfig = baseConfig[0];
        return oldConfig(browserConfig);`
            : 'return webpackMerge(baseConfig[0], baseWebpackConfig);'}};`
        : `export default ${createConfigContents}`}`;
    tree.write((0, devkit_1.joinPathFragments)(root, 'rspack.config.ts'), configContents);
}
