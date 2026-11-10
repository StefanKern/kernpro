"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const path_1 = require("path");
const semver_1 = require("semver");
const versions_1 = require("../../../utils/versions");
function normalizeOptions(tree, options) {
    let rxjsVersion;
    try {
        rxjsVersion = (0, internal_1.checkAndCleanWithSemver)(tree, 'rxjs', (0, devkit_1.readJson)(tree, 'package.json').dependencies['rxjs']);
    }
    catch {
        rxjsVersion = (0, internal_1.checkAndCleanWithSemver)(tree, 'rxjs', versions_1.rxjsVersion);
    }
    const rxjsMajorVersion = (0, semver_1.major)(rxjsVersion);
    const { subdirectory, name } = determineSubdirectoryAndName(options.name);
    return {
        ...options,
        name,
        subdirectory,
        parentDirectory: options.parent ? (0, path_1.dirname)(options.parent) : undefined,
        route: options.route === '' ? `''` : (options.route ?? `''`),
        directory: (0, devkit_1.names)(options.directory).fileName,
        rxjsVersion,
        rxjsMajorVersion,
    };
}
function determineSubdirectoryAndName(name) {
    if (name.includes('/')) {
        const parts = name.split('/');
        const storeName = parts.pop();
        const subdirectory = (0, devkit_1.joinPathFragments)(...parts);
        return { subdirectory, name: storeName };
    }
    else {
        return { name };
    }
}
