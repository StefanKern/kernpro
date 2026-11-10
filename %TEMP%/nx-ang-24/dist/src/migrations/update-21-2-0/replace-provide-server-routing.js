"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const tsquery_1 = require("@phenomnomnominal/tsquery");
const ts = tslib_1.__importStar(require("typescript"));
const file_change_recorder_1 = require("../../utils/file-change-recorder");
const projects_1 = require("../utils/projects");
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/ssr',
    ]);
    if (!projects.length) {
        return;
    }
    for (const graphNode of projects) {
        (0, devkit_1.visitNotIgnoredFiles)(tree, graphNode.data.root, (file) => {
            if (!file.endsWith('.ts') || file.endsWith('.d.ts')) {
                return;
            }
            processFile(tree, file);
        });
    }
    await (0, devkit_1.formatFiles)(tree);
}
function processFile(tree, filePath) {
    const content = tree.read(filePath, 'utf-8');
    if ((!content.includes('provideServerRouting') &&
        !content.includes('provideServerRoutesConfig')) ||
        !content.includes('@angular/ssr')) {
        return;
    }
    const sourceFile = (0, tsquery_1.ast)(content);
    const providersArray = (0, tsquery_1.query)(sourceFile, 'PropertyAssignment:has(Identifier[name=providers]) > ArrayLiteralExpression')[0];
    if (!providersArray) {
        return;
    }
    if (!providersArray.elements.some((el) => ts.isCallExpression(el) &&
        ts.isIdentifier(el.expression) &&
        (el.expression.getText() === 'provideServerRouting' ||
            el.expression.getText() === 'provideServerRoutesConfig'))) {
        return;
    }
    const recorder = new file_change_recorder_1.FileChangeRecorder(tree, filePath);
    const printer = ts.createPrinter({
        newLine: ts.NewLineKind.LineFeed,
    });
    let provideServerRenderingCall;
    let provideServerRoutingCall;
    const providerCallNodes = providersArray.elements.filter((el) => ts.isCallExpression(el));
    for (const node of providerCallNodes) {
        if (node.expression.getText() === 'provideServerRendering') {
            provideServerRenderingCall = node;
        }
        else if (node.expression.getText() === 'provideServerRouting' ||
            node.expression.getText() === 'provideServerRoutesConfig') {
            provideServerRoutingCall = node;
        }
    }
    const withRoutesCall = ts.factory.createCallExpression(ts.factory.createIdentifier('withRoutes'), undefined, [provideServerRoutingCall.arguments.at(0)]);
    let updatedProvidersArray;
    if (provideServerRenderingCall) {
        // remove the "provideServerRouting" and "provideServerRoutesConfig"
        // calls and update the existing "provideServerRendering" call
        updatedProvidersArray = ts.factory.updateArrayLiteralExpression(providersArray, providersArray.elements
            .filter((el) => !(ts.isCallExpression(el) &&
            ts.isIdentifier(el.expression) &&
            (el.expression.text === 'provideServerRouting' ||
                el.expression.text === 'provideServerRoutesConfig')))
            .map((el) => {
            if (ts.isCallExpression(el) &&
                ts.isIdentifier(el.expression) &&
                el.expression.text === 'provideServerRendering') {
                return ts.factory.updateCallExpression(el, el.expression, el.typeArguments, [withRoutesCall, ...provideServerRoutingCall.arguments.slice(1)]);
            }
            return el;
        }));
    }
    else {
        // replace the "provideServerRouting" and "provideServerRoutesConfig"
        // calls with the new "provideServerRendering" call
        updatedProvidersArray = ts.factory.updateArrayLiteralExpression(providersArray, providersArray.elements.map((el) => {
            if (ts.isCallExpression(el) &&
                ts.isIdentifier(el.expression) &&
                (el.expression.text === 'provideServerRouting' ||
                    el.expression.text === 'provideServerRoutesConfig')) {
                return ts.factory.createCallExpression(ts.factory.createIdentifier('provideServerRendering'), undefined, [withRoutesCall, ...provideServerRoutingCall.arguments.slice(1)]);
            }
            return el;
        }));
    }
    recorder.replace(providersArray, printer.printNode(ts.EmitHint.Unspecified, updatedProvidersArray, sourceFile));
    const importDecl = sourceFile.statements.find((stmt) => ts.isImportDeclaration(stmt) &&
        ts.isStringLiteral(stmt.moduleSpecifier) &&
        stmt.moduleSpecifier.text === '@angular/ssr');
    if (importDecl?.importClause?.namedBindings) {
        const namedBindings = importDecl?.importClause.namedBindings;
        if (ts.isNamedImports(namedBindings)) {
            // remove the "provideServerRouting" and "provideServerRoutesConfig"
            // imports and ensure we have the "withRoutes" import
            const updatedElementNames = new Set([
                ...namedBindings.elements
                    .map((el) => el.getText())
                    .filter((x) => x !== 'provideServerRouting' && x !== 'provideServerRoutesConfig'),
                'withRoutes',
            ]);
            const updatedNamedBindings = ts.factory.updateNamedImports(namedBindings, Array.from(updatedElementNames).map((name) => ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))));
            const printer = ts.createPrinter({
                newLine: ts.NewLineKind.LineFeed,
            });
            recorder.replace(namedBindings, printer.printNode(ts.EmitHint.Unspecified, updatedNamedBindings, sourceFile));
        }
    }
    recorder.applyChanges();
}
