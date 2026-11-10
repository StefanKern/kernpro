"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const COLLECTION = '@nx/angular';
const REMOVED_GENERATORS = [
    'scam',
    'scam-directive',
    'scam-pipe',
    'scam-to-standalone',
];
async function default_1(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree);
    if (nxJson && removeGeneratorDefaults(nxJson)) {
        (0, devkit_1.updateNxJson)(tree, nxJson);
    }
    const angularJsonProjects = removeAngularJsonGeneratorDefaults(tree);
    for (const [projectName, project] of (0, devkit_1.getProjects)(tree)) {
        // updateProjectConfiguration can't write angular.json projects.
        if (angularJsonProjects.has(projectName)) {
            continue;
        }
        if (removeGeneratorDefaults(project)) {
            (0, devkit_1.updateProjectConfiguration)(tree, projectName, project);
        }
    }
    await (0, devkit_1.formatFiles)(tree);
    return { skipAgentic: true };
}
function removeAngularJsonGeneratorDefaults(tree) {
    if (!tree.exists('angular.json')) {
        return new Set();
    }
    const angularJson = (0, devkit_1.readJson)(tree, 'angular.json');
    const projects = isRecord(angularJson.projects)
        ? angularJson.projects
        : {};
    let changed = false;
    for (const project of Object.values(projects)) {
        if (!isRecord(project)) {
            continue;
        }
        // The Angular CLI uses `schematics`, and Nx also reads `generators`.
        for (const key of ['schematics', 'generators']) {
            const config = { generators: project[key] };
            if (removeGeneratorDefaults(config)) {
                project[key] = config.generators;
                changed = true;
            }
        }
    }
    if (changed) {
        (0, devkit_1.writeJson)(tree, 'angular.json', angularJson);
    }
    return new Set(Object.keys(projects));
}
function removeGeneratorDefaults(config) {
    const { generators } = config;
    if (!isRecord(generators)) {
        return false;
    }
    let changed = removeKeys(generators, REMOVED_GENERATORS.map((generator) => `${COLLECTION}:${generator}`));
    const collection = generators[COLLECTION];
    if (isRecord(collection) && removeKeys(collection, REMOVED_GENERATORS)) {
        changed = true;
        if (Object.keys(collection).length === 0) {
            delete generators[COLLECTION];
        }
    }
    if (changed && Object.keys(generators).length === 0) {
        // `delete` would keep the old value: updateProjectConfiguration merges into package.json `nx`.
        config.generators = undefined;
    }
    return changed;
}
function removeKeys(obj, keys) {
    const presentKeys = keys.filter((key) => key in obj);
    for (const key of presentKeys) {
        delete obj[key];
    }
    return presentKeys.length > 0;
}
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
