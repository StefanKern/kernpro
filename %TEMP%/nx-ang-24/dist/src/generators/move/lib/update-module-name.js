"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateModuleName = updateModuleName;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
/**
 * Updates the Angular module name (including the spec file and index.ts)
 *
 * Again, if the user has deviated from the expected folder
 * structure, they are very much on their own.
 *
 * @param schema The options provided to the schematic
 */
function updateModuleName(tree, { oldProjectName, newProjectName }) {
    const unscopedNewProjectName = newProjectName.startsWith('@')
        ? newProjectName.split('/')[1]
        : newProjectName;
    if (oldProjectName === unscopedNewProjectName) {
        return;
    }
    const project = (0, devkit_1.readProjectConfiguration)(tree, newProjectName);
    if (project.projectType === 'application') {
        // Expect the module to be something like 'app.module.ts' regardless of the folder name,
        // Therefore, nothing to do.
        return;
    }
    const moduleName = {
        from: `${(0, devkit_1.names)(oldProjectName).className}Module`,
        to: `${(0, devkit_1.names)(unscopedNewProjectName).className}Module`,
    };
    const findModuleName = new RegExp(`\\b${moduleName.from}`, 'g');
    const moduleFiles = [
        {
            from: `${oldProjectName}.module`,
            fromRegex: new RegExp(`\\b${oldProjectName}\\.module`, 'g'),
            to: `${unscopedNewProjectName}.module`,
        },
        {
            from: `${oldProjectName}-module`,
            fromRegex: new RegExp(`\\b${oldProjectName}-module`, 'g'),
            to: `${unscopedNewProjectName}-module`,
        },
    ];
    const sourceRoot = (0, internal_1.getProjectSourceRoot)(project, tree);
    const filesToRename = moduleFiles.flatMap((moduleFile) => [
        {
            from: `${sourceRoot}/lib/${moduleFile.from}.ts`,
            to: `${sourceRoot}/lib/${moduleFile.to}.ts`,
        },
        {
            from: `${sourceRoot}/lib/${moduleFile.from}.spec.ts`,
            to: `${sourceRoot}/lib/${moduleFile.to}.spec.ts`,
        },
    ].filter((rename) => rename.from !== rename.to));
    if (filesToRename.length === 0) {
        return;
    }
    const replacements = [
        ...moduleFiles.map((moduleFile) => ({
            regex: moduleFile.fromRegex,
            replaceWith: moduleFile.to,
        })),
        {
            regex: findModuleName,
            replaceWith: moduleName.to,
        },
    ];
    // Update the module file and its spec file
    filesToRename.forEach((file) => {
        if (tree.exists(file.from)) {
            updateFileContent(tree, replacements, file.from, file.to);
            tree.delete(file.from);
        }
    });
    // update index file
    const indexFile = (0, devkit_1.joinPathFragments)(sourceRoot, 'index.ts');
    if (tree.exists(indexFile)) {
        updateFileContent(tree, replacements, indexFile);
    }
    const skipFiles = [...filesToRename.map((file) => file.to), indexFile];
    // Update any files which import the module
    for (const [, definition] of (0, devkit_1.getProjects)(tree)) {
        (0, devkit_1.visitNotIgnoredFiles)(tree, definition.root, (file) => {
            const normalizedFile = (0, devkit_1.normalizePath)(file);
            // skip files that were already modified
            if (skipFiles.includes(normalizedFile)) {
                return;
            }
            updateFileContent(tree, replacements, normalizedFile);
        });
    }
}
function updateFileContent(tree, replacements, fileName, newFileName) {
    let content = tree.read(fileName, 'utf-8');
    if (content) {
        let updated = false;
        replacements.forEach((replacement) => {
            if (replacement.regex.test(content)) {
                content = content.replace(replacement.regex, replacement.replaceWith);
                updated = true;
            }
        });
        if (updated) {
            tree.write(newFileName ?? fileName, content);
        }
    }
}
