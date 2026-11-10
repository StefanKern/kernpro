"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/js/internal");
const tsconfig_utils_1 = require("../../generators/utils/tsconfig-utils");
const file_change_recorder_1 = require("../../utils/file-change-recorder");
const targets_1 = require("../../utils/targets");
const projects_1 = require("../utils/projects");
const serverExecutors = new Set([
    '@angular-devkit/build-angular:server',
    '@nx/angular:webpack-server',
]);
let ts;
async function default_1(tree) {
    const projects = await (0, projects_1.getProjectsFilteredByDependencies)([
        'npm:@angular/ssr',
    ]);
    // Map project root → {tsConfigPath, serverFiles[]}
    const projectFilesMap = new Map();
    // First pass: collect files grouped by project
    for (const { data: project } of projects) {
        if (project.projectType !== 'application') {
            continue;
        }
        for (const target of Object.values(project.targets ?? {})) {
            if (!serverExecutors.has(target.executor)) {
                continue;
            }
            const tsConfigServerPath = (0, devkit_1.joinPathFragments)(project.root, 'tsconfig.server.json');
            if (!tree.exists(tsConfigServerPath)) {
                continue;
            }
            // Get or create entry for this project
            let projectEntry = projectFilesMap.get(project.root);
            if (!projectEntry) {
                projectEntry = {
                    tsConfigPath: tsConfigServerPath,
                    serverFiles: new Set(),
                };
                projectFilesMap.set(project.root, projectEntry);
            }
            // Collect server files for this project
            for (const [, options] of (0, targets_1.allTargetOptions)(target)) {
                if (options?.main && tree.exists(options.main)) {
                    projectEntry.serverFiles.add(options.main);
                }
            }
        }
    }
    if (projectFilesMap.size === 0) {
        return;
    }
    // Second pass: process each project
    ts = (0, internal_1.ensureTypescript)();
    for (const { tsConfigPath, serverFiles } of projectFilesMap.values()) {
        const wasUpdated = updateTsConfigServer(tree, tsConfigPath);
        // Only update server files if tsconfig was actually modified
        if (wasUpdated) {
            for (const serverFile of serverFiles) {
                updateServerImports(tree, serverFile);
            }
        }
    }
    await (0, devkit_1.formatFiles)(tree);
}
function updateTsConfigServer(tree, tsConfigPath) {
    const compilerOptions = (0, tsconfig_utils_1.readCompilerOptionsFromTsConfig)(tree, tsConfigPath);
    if (compilerOptions.module === ts.ModuleKind.Preserve &&
        compilerOptions.moduleResolution === ts.ModuleResolutionKind.Bundler) {
        // Already configured correctly, skip
        return false;
    }
    (0, devkit_1.updateJson)(tree, tsConfigPath, (json) => {
        json.compilerOptions ??= {};
        json.compilerOptions.module = 'preserve';
        json.compilerOptions.moduleResolution = 'bundler';
        return json;
    });
    return true;
}
function updateServerImports(tree, serverFilePath) {
    const content = tree.read(serverFilePath, 'utf-8');
    const sourceFile = ts.createSourceFile(serverFilePath, content, ts.ScriptTarget.Latest, true);
    const allImportDeclarations = sourceFile.statements.filter(ts.isImportDeclaration);
    if (allImportDeclarations.length === 0) {
        return;
    }
    let recorder;
    // Find namespace imports (import * as X from 'Y')
    for (const importDecl of allImportDeclarations) {
        if (!ts.isStringLiteral(importDecl.moduleSpecifier)) {
            continue;
        }
        const namedBindings = importDecl.importClause?.namedBindings;
        // Check if this is a namespace import (import * as X) and there's no
        // default import (e.g., "import express, * as types from 'express'")
        if (namedBindings &&
            ts.isNamespaceImport(namedBindings) &&
            !importDecl.importClause?.name) {
            const importName = namedBindings.name.text;
            const moduleSpecifier = importDecl.moduleSpecifier.text;
            recorder ??= new file_change_recorder_1.FileChangeRecorder(tree, serverFilePath);
            // import * as express from 'express' -> import express from 'express'
            recorder.replace(importDecl, `import ${importName} from '${moduleSpecifier}';`);
        }
    }
    if (recorder) {
        recorder.applyChanges();
    }
}
