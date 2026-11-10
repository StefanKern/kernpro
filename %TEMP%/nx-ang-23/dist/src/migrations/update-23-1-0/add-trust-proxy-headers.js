"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const ts = tslib_1.__importStar(require("typescript"));
const file_change_recorder_1 = require("../../utils/file-change-recorder");
const projects_1 = require("../utils/projects");
const TODO_COMMENT = '// TODO: This is a security-sensitive option. Remove if not needed. ' +
    'For more information, see https://angular.dev/best-practices/security#configuring-trusted-proxy-headers';
const TRUST_PROXY_HEADERS = `trustProxyHeaders: ['x-forwarded-host', 'x-forwarded-proto'],`;
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/ssr',
    ]);
    for (const graphNode of projects) {
        (0, devkit_1.visitNotIgnoredFiles)(tree, graphNode.data.root, (path) => {
            if (!path.endsWith('.ts') || path.endsWith('.d.ts')) {
                return;
            }
            const content = tree.read(path, 'utf-8');
            // Skip already-migrated files and files not instantiating an SSR engine.
            if (content.includes(TODO_COMMENT) ||
                (!content.includes('AngularNodeAppEngine') &&
                    !content.includes('AngularAppEngine'))) {
                return;
            }
            const sourceFile = ts.createSourceFile(path, content, ts.ScriptTarget.Latest, true);
            let recorder;
            const visit = (node) => {
                if (ts.isNewExpression(node) &&
                    ts.isIdentifier(node.expression) &&
                    (node.expression.text === 'AngularNodeAppEngine' ||
                        node.expression.text === 'AngularAppEngine')) {
                    if (!node.arguments || node.arguments.length === 0) {
                        // No options object: insert one before the closing parenthesis.
                        recorder ??= new file_change_recorder_1.FileChangeRecorder(tree, path);
                        recorder.insertRight(node.end - 1, `{\n  ${TODO_COMMENT}\n  ${TRUST_PROXY_HEADERS}\n}`);
                    }
                    else if (ts.isObjectLiteralExpression(node.arguments[0])) {
                        const optionsArg = node.arguments[0];
                        const hasTrustProxyHeaders = optionsArg.properties.some((prop) => ts.isPropertyAssignment(prop) &&
                            (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name)) &&
                            prop.name.text === 'trustProxyHeaders');
                        if (!hasTrustProxyHeaders) {
                            // Insert right after the opening brace of the options object.
                            recorder ??= new file_change_recorder_1.FileChangeRecorder(tree, path);
                            recorder.insertRight(optionsArg.getStart() + 1, `\n  ${TODO_COMMENT}\n  ${TRUST_PROXY_HEADERS}`);
                        }
                    }
                }
                ts.forEachChild(node, visit);
            };
            visit(sourceFile);
            if (recorder) {
                recorder.applyChanges();
            }
        });
    }
    await (0, devkit_1.formatFiles)(tree);
}
