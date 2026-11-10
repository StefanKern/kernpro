"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const picomatch = require("picomatch");
const tsquery_1 = require("@phenomnomnominal/tsquery");
async function default_1(tree) {
    (0, devkit_1.visitNotIgnoredFiles)(tree, '', (path) => {
        const webpackConfigGlob = '**/webpack*.config*.{js,ts,mjs,cjs}';
        const result = picomatch(webpackConfigGlob)(path);
        if (!result) {
            return;
        }
        let webpackConfigContents = tree.read(path, 'utf-8');
        if (!/withModuleFederationSSR|withModuleFederation/.test(webpackConfigContents)) {
            return;
        }
        const WITH_MODULE_FEDERATION_SELECTOR = 'CallExpression:has(Identifier[name=withModuleFederation]),CallExpression:has(Identifier[name=withModuleFederationForSSR])';
        const EXISTING_MF_OVERRIDES_SELECTOR = 'ObjectLiteralExpression';
        const sourceFile = (0, tsquery_1.ast)(webpackConfigContents);
        const withModuleFederationNodes = (0, tsquery_1.query)(sourceFile, WITH_MODULE_FEDERATION_SELECTOR);
        if (!withModuleFederationNodes.length) {
            return;
        }
        const withModuleFederationNode = withModuleFederationNodes[0];
        const existingOverridesNodes = (0, tsquery_1.query)(withModuleFederationNode, EXISTING_MF_OVERRIDES_SELECTOR);
        if (!existingOverridesNodes.length) {
            // doesn't exist, add it
            webpackConfigContents = `${webpackConfigContents.slice(0, withModuleFederationNode.getEnd() - 1)},${JSON.stringify({ dts: false })}${webpackConfigContents.slice(withModuleFederationNode.getEnd() - 1)}`;
        }
        else {
            let existingOverrideNode;
            for (const node of existingOverridesNodes) {
                if (!existingOverrideNode) {
                    existingOverrideNode = node;
                }
                if (existingOverrideNode.getText().includes(node.getText())) {
                    continue;
                }
                existingOverrideNode = node;
            }
            const DTS_PROPERTY_SELECTOR = 'PropertyAssignment > Identifier[name=dts]';
            const dtsPropertyNode = (0, tsquery_1.query)(existingOverrideNode, DTS_PROPERTY_SELECTOR);
            if (dtsPropertyNode.length) {
                // dts already exists, do nothing
                return;
            }
            const newOverrides = `{ dts: false, ${existingOverrideNode
                .getText()
                .slice(1)}`;
            webpackConfigContents = `${webpackConfigContents.slice(0, existingOverrideNode.getStart())}${newOverrides}${webpackConfigContents.slice(existingOverrideNode.getEnd())}`;
        }
        tree.write(path, webpackConfigContents);
    });
    await (0, devkit_1.formatFiles)(tree);
}
