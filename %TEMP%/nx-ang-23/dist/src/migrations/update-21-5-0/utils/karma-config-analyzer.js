"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeKarmaConfig = analyzeKarmaConfig;
/**
 * Adapts the private utility from Angular CLI to be used in the migration.
 */
const internal_1 = require("@nx/js/internal");
let ts;
/**
 * Analyzes the content of a Karma configuration file to extract its settings.
 *
 * @param content The string content of the `karma.conf.js` file.
 * @returns An object containing the configuration settings and a flag indicating if unsupported values were found.
 */
function analyzeKarmaConfig(content) {
    if (!ts) {
        ts = (0, internal_1.ensureTypescript)();
    }
    const sourceFile = ts.createSourceFile('karma.conf.js', content, ts.ScriptTarget.Latest, true);
    const settings = new Map();
    let hasUnsupportedValues = false;
    function visit(node) {
        // The Karma configuration is defined within a `config.set({ ... })` call.
        if (ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            node.expression.expression.getText(sourceFile) === 'config' &&
            node.expression.name.text === 'set' &&
            node.arguments.length === 1 &&
            ts.isObjectLiteralExpression(node.arguments[0])) {
            // We found `config.set`, now we extract the properties from the object literal.
            for (const prop of node.arguments[0].properties) {
                if (isSupportedPropertyAssignment(prop)) {
                    const key = prop.name.text;
                    const value = extractValue(prop.initializer);
                    settings.set(key, value);
                }
                else {
                    hasUnsupportedValues = true;
                }
            }
        }
        else {
            ts.forEachChild(node, visit);
        }
    }
    function extractValue(node) {
        switch (node.kind) {
            case ts.SyntaxKind.StringLiteral:
                return node.text;
            case ts.SyntaxKind.NumericLiteral:
                return Number(node.text);
            case ts.SyntaxKind.TrueKeyword:
                return true;
            case ts.SyntaxKind.FalseKeyword:
                return false;
            case ts.SyntaxKind.Identifier: {
                const identifier = node.text;
                if (identifier === '__dirname' || identifier === '__filename') {
                    return identifier;
                }
                break;
            }
            case ts.SyntaxKind.CallExpression: {
                const callExpr = node;
                // Handle require('...')
                if (ts.isIdentifier(callExpr.expression) &&
                    callExpr.expression.text === 'require' &&
                    callExpr.arguments.length === 1 &&
                    ts.isStringLiteral(callExpr.arguments[0])) {
                    return { module: callExpr.arguments[0].text };
                }
                // Handle calls on a require, e.g. require('path').join()
                const calleeValue = extractValue(callExpr.expression);
                if (isRequireInfo(calleeValue)) {
                    return {
                        ...calleeValue,
                        isCall: true,
                        arguments: callExpr.arguments.map(extractValue),
                    };
                }
                break;
            }
            case ts.SyntaxKind.PropertyAccessExpression: {
                const propAccessExpr = node;
                // Handle config constants like `config.LOG_INFO`
                if (ts.isIdentifier(propAccessExpr.expression) &&
                    propAccessExpr.expression.text === 'config') {
                    return `config.${propAccessExpr.name.text}`;
                }
                const value = extractValue(propAccessExpr.expression);
                if (isRequireInfo(value)) {
                    const currentExport = value.export
                        ? `${value.export}.${propAccessExpr.name.text}`
                        : propAccessExpr.name.text;
                    return { ...value, export: currentExport };
                }
                break;
            }
            case ts.SyntaxKind.ArrayLiteralExpression:
                return node.elements.map(extractValue);
            case ts.SyntaxKind.ObjectLiteralExpression: {
                const obj = {};
                for (const prop of node.properties) {
                    if (isSupportedPropertyAssignment(prop)) {
                        // Recursively extract values for nested objects.
                        obj[prop.name.text] = extractValue(prop.initializer);
                    }
                    else {
                        hasUnsupportedValues = true;
                    }
                }
                return obj;
            }
        }
        // For complex expressions (like variables) that we don't need to resolve,
        // we mark the analysis as potentially incomplete.
        hasUnsupportedValues = true;
        return undefined;
    }
    visit(sourceFile);
    return { settings, hasUnsupportedValues };
}
function isRequireInfo(value) {
    return (typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        'module' in value);
}
function isSupportedPropertyAssignment(prop) {
    return (ts.isPropertyAssignment(prop) &&
        (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)));
}
