"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableStrictTypeChecking = enableStrictTypeChecking;
const devkit_1 = require("@nx/devkit");
const version_utils_1 = require("../../utils/version-utils");
function enableStrictTypeChecking(host, options) {
    // This matches the settings defined by the Angular CLI https://angular.io/guide/strict-mode
    const compilerOptions = {
        strict: true,
        noImplicitOverride: true,
        noPropertyAccessFromIndexSignature: true,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
    };
    const appTsConfigPath = `${options.appProjectRoot}/tsconfig.json`;
    if (host.exists(appTsConfigPath)) {
        const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(host);
        (0, devkit_1.updateJson)(host, appTsConfigPath, (json) => {
            json.compilerOptions = { ...json.compilerOptions, ...compilerOptions };
            json.angularCompilerOptions = {
                ...json.angularCompilerOptions,
                strictInjectionParameters: true,
                strictInputAccessModifiers: true,
                typeCheckHostBindings: angularMajorVersion === 20 ? true : undefined,
                strictTemplates: true,
            };
            return json;
        });
    }
    const e2eTsConfigPath = `${options.e2eProjectRoot}/tsconfig.json`;
    if (host.exists(e2eTsConfigPath)) {
        (0, devkit_1.updateJson)(host, e2eTsConfigPath, (json) => {
            json.compilerOptions = { ...json.compilerOptions, ...compilerOptions };
            return json;
        });
    }
}
