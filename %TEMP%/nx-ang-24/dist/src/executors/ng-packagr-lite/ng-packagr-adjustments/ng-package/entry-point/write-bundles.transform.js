"use strict";
/**
 * Adapted from the original ng-packagr.
 *
 * Changes made:
 * - Removed bundling altogether.
 * - Write the ESM2022 outputs to the file system.
 * - Fake the FESM2022 outputs pointing them to the ESM2022 outputs.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.writeBundlesTransform = void 0;
exports.removeSourceMappingUrl = removeSourceMappingUrl;
exports.remapDeclarationMapSources = remapDeclarationMapSources;
exports.normalizeEsm2022Path = normalizeEsm2022Path;
const tslib_1 = require("tslib");
const transform_1 = require("ng-packagr/src/lib/graph/transform");
const nodes_1 = require("ng-packagr/src/lib/ng-package/nodes");
const ngPackagrNodes = tslib_1.__importStar(require("ng-packagr/src/lib/ng-package/nodes"));
const package_1 = require("ng-packagr/src/lib/ng-package/package");
const path_1 = require("ng-packagr/src/lib/utils/path");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
const entry_point_1 = require("./entry-point");
async function shouldWriteFile(filePath, newContent) {
    try {
        const existingContent = await (0, promises_1.readFile)(filePath, 'utf-8');
        return existingContent !== newContent;
    }
    catch (error) {
        // If we can't read the existing file (including if it doesn't exist), write the new one
        return true;
    }
}
// ng-packagr 22.2.0 to 22.2.3 build entry points in parallel and export this
// to find the one a graph is scoped to. 22.2.4 reverted that:
// https://github.com/ng-packagr/ng-packagr/issues/3451
const { getActiveEntryPoint } = ngPackagrNodes;
const writeBundlesTransform = (_options) => {
    return (0, transform_1.transformFromPromise)(async (graph) => {
        const entryPointNode = getActiveEntryPoint
            ? getActiveEntryPoint(graph)
            : graph.find((0, nodes_1.isEntryPointInProgress)());
        if (!entryPointNode) {
            return;
        }
        const entryPoint = toCustomNgEntryPoint(entryPointNode.data.entryPoint);
        entryPointNode.data.entryPoint = entryPoint;
        entryPointNode.data.destinationFiles = entryPoint.destinationFiles;
        // ngc builds the flat module file in memory and never writes it to disk, so
        // the declaration map emitted for it points at a source that doesn't exist.
        const flatModuleDeclarations = (0, node_path_1.normalize)(entryPointNode.data.destinationFiles.declarations);
        const flatModuleDeclarationsMap = `${flatModuleDeclarations}.map`;
        for (const [path, outputCache,] of entryPointNode.cache.outputCache.entries()) {
            const originalPath = (0, node_path_1.normalize)(path);
            if (originalPath === flatModuleDeclarationsMap) {
                continue;
            }
            const normalizedPath = normalizeEsm2022Path(path, entryPoint);
            let content = outputCache.content;
            if (originalPath === flatModuleDeclarations) {
                // its declaration map is dropped above, so don't leave a reference behind
                content = removeSourceMappingUrl(content);
            }
            else if (normalizedPath.endsWith('.d.ts.map')) {
                // declaration maps under tmp-typings land one directory up, so their
                // source paths need rebasing
                content = remapDeclarationMapSources(path, normalizedPath, content);
            }
            // Only write if content has changed
            if (await shouldWriteFile(normalizedPath, content)) {
                await (0, promises_1.mkdir)((0, node_path_1.dirname)(normalizedPath), { recursive: true });
                await (0, promises_1.writeFile)(normalizedPath, content);
            }
        }
        if (!entryPointNode.cache.outputCache.size &&
            entryPoint.isSecondaryEntryPoint) {
            await (0, promises_1.mkdir)(entryPoint.destinationPath, { recursive: true });
        }
        if (!entryPoint.isSecondaryEntryPoint) {
            // the primary manifest reads every entry point, so adjust any that have
            // not been processed yet
            for (const node of graph.filter((0, nodes_1.byEntryPoint)())) {
                if (node === entryPointNode) {
                    continue;
                }
                const nodeEntryPoint = toCustomNgEntryPoint(node.data.entryPoint);
                node.data.entryPoint = nodeEntryPoint;
                node.data.destinationFiles = nodeEntryPoint.destinationFiles;
            }
            const packageNode = graph.find(nodes_1.isPackage);
            if (packageNode) {
                packageNode.data = new package_1.NgPackage(packageNode.data.src, toCustomNgEntryPoint(packageNode.data.primary), packageNode.data.secondaries.map((secondary) => toCustomNgEntryPoint(secondary)));
            }
        }
    });
};
exports.writeBundlesTransform = writeBundlesTransform;
function removeSourceMappingUrl(content) {
    return content.replace(/\/\/# sourceMappingURL=[^\r\n]*\s*$/, '');
}
function remapDeclarationMapSources(originalPath, newPath, content) {
    const originalDir = (0, node_path_1.dirname)((0, node_path_1.normalize)(originalPath));
    const newDir = (0, node_path_1.dirname)((0, node_path_1.normalize)(newPath));
    if (originalDir === newDir) {
        return content;
    }
    let map;
    try {
        map = JSON.parse(content);
    }
    catch {
        return content;
    }
    if (!map || typeof map !== 'object' || !Array.isArray(map.sources)) {
        return content;
    }
    // ng-packagr forces `sourceRoot: ''`, so sources are relative to the map file.
    // A non-empty root is prepended to each source, so rebasing them alone is wrong.
    if (map.sourceRoot) {
        return content;
    }
    map.sources = map.sources.map((source) => typeof source === 'string'
        ? (0, path_1.ensureUnixPath)((0, node_path_1.relative)(newDir, (0, node_path_1.resolve)(originalDir, source)))
        : source);
    return JSON.stringify(map);
}
function normalizeEsm2022Path(path, entryPoint) {
    const normalizedPath = (0, node_path_1.normalize)(path);
    if (!entryPoint.primaryDestinationPath) {
        return normalizedPath;
    }
    // rewrite only below the destination path, which may itself contain the segment
    const tmpEsm2022Dir = (0, node_path_1.join)(entryPoint.primaryDestinationPath, 'tmp-esm2022') + node_path_1.sep;
    if (normalizedPath.startsWith(tmpEsm2022Dir)) {
        return (0, node_path_1.join)(entryPoint.primaryDestinationPath, 'esm2022', normalizedPath.slice(tmpEsm2022Dir.length));
    }
    const tmpTypingsDir = (0, node_path_1.join)(entryPoint.primaryDestinationPath, 'tmp-typings') + node_path_1.sep;
    if (normalizedPath.startsWith(tmpTypingsDir)) {
        return (0, node_path_1.join)(entryPoint.primaryDestinationPath, normalizedPath.slice(tmpTypingsDir.length));
    }
    return normalizedPath;
}
function toCustomNgEntryPoint(entryPoint) {
    return (0, entry_point_1.createNgEntryPoint)(entryPoint.packageJson, entryPoint.ngPackageJson, entryPoint.basePath, 
    // @ts-expect-error this is a TS private property, but it can be accessed at runtime
    entryPoint.secondaryData);
}
