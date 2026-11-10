"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectsFilteredByDependencies = getProjectsFilteredByDependencies;
const devkit_1 = require("@nx/devkit");
async function getProjectsFilteredByDependencies(dependencies) {
    const projectGraph = await (0, devkit_1.createProjectGraphAsync)();
    return Object.entries(projectGraph.dependencies)
        .filter(([node, deps]) => !projectGraph.externalNodes?.[node] &&
        deps.some(({ target }) => dependencies.includes(target)))
        .map(([projectName]) => projectGraph.nodes[projectName]);
}
