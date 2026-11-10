"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProject = validateProject;
exports.validateClassName = validateClassName;
exports.assertNotUsingTsSolutionSetup = assertNotUsingTsSolutionSetup;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
function validateProject(tree, projectName) {
    const projects = (0, devkit_1.getProjects)(tree);
    if (!projects.has(projectName)) {
        throw new Error(`Project "${projectName}" does not exist! Please provide an existing project name.`);
    }
}
// The below validation matches that of the Angular CLI:
// https://github.com/angular/angular-cli/blob/1316930a1cbad8e71a4454743862cfa9253bef4e/packages/schematics/angular/utility/validation.ts#L25
// See: https://github.com/tc39/proposal-regexp-unicode-property-escapes/blob/fe6d07fad74cd0192d154966baa1e95e7cda78a1/README.md#other-examples
const ecmaIdentifierNameRegExp = /^(?:[$_\p{ID_Start}])(?:[$_\u200C\u200D\p{ID_Continue}])*$/u;
function validateClassName(className) {
    if (!ecmaIdentifierNameRegExp.test(className)) {
        throw new Error(`Class name "${className}" is invalid.`);
    }
}
function assertNotUsingTsSolutionSetup(tree, generatorName) {
    if (process.env.NX_IGNORE_UNSUPPORTED_TS_SETUP === 'true' ||
        !(0, internal_1.isUsingTsSolutionSetup)(tree)) {
        return;
    }
    const artifactString = generatorName === 'init'
        ? `"@nx/angular" plugin`
        : `"@nx/angular:${generatorName}" generator`;
    devkit_1.output.error({
        title: `The ${artifactString} doesn't support the existing TypeScript setup`,
        bodyLines: [
            `The Angular framework doesn't support a TypeScript setup with project references. See https://github.com/angular/angular/issues/37276 for more details.`,
            `You can ignore this error, at your own risk, by setting the "NX_IGNORE_UNSUPPORTED_TS_SETUP" environment variable to "true".`,
        ],
    });
    throw new Error(`The ${artifactString} doesn't support the existing TypeScript setup. See the error above.`);
}
