"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findModule = findModule;
exports.addToNgModule = addToNgModule;
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const internal_1 = require("@nx/js/internal");
const js_1 = require("@nx/js");
const insert_ngmodule_import_1 = require("./insert-ngmodule-import");
let tsModule;
function findModule(tree, path, module) {
    const candidatePaths = [];
    let pathToSearch = path;
    while (pathToSearch !== '.' && pathToSearch !== '/') {
        if (module) {
            const pathToModule = (0, devkit_1.joinPathFragments)(pathToSearch, module);
            if (tree.exists(pathToModule)) {
                candidatePaths.push(pathToModule);
                break;
            }
        }
        else {
            const potentialOptions = tree
                .children(pathToSearch)
                .filter((f) => f.endsWith('.module.ts') || f.endsWith('-module.ts'));
            if (potentialOptions.length > 0) {
                candidatePaths.push(...potentialOptions.map((p) => (0, devkit_1.joinPathFragments)(pathToSearch, p)));
                break;
            }
        }
        pathToSearch = (0, path_1.dirname)(pathToSearch);
    }
    if (candidatePaths.length === 0) {
        throw new Error('Could not find a declaring module file.');
    }
    const modules = candidatePaths.filter((p) => {
        const moduleContents = tree.read(p, 'utf-8');
        return moduleContents.includes('@NgModule');
    });
    if (modules.length === 0) {
        throw new Error(candidatePaths.length === 1
            ? `Declaring module file (${candidatePaths[0]}) does not contain an @NgModule Declaration.`
            : `Declaring module files (${candidatePaths.join(', ')}) do not contain an @NgModule Declaration.`);
    }
    if (modules.length > 1) {
        throw new Error(`More than one NgModule was found. Please provide the NgModule you wish to use.`);
    }
    return modules[0];
}
function addToNgModule(tree, path, modulePath, name, className, fileName, ngModuleProperty, 
// TODO(leo): remove once all consumers are updated
// // check if exported in the public api
isFlat = true, isExported = false) {
    if (!tsModule) {
        tsModule = (0, internal_1.ensureTypescript)();
    }
    let relativePath = `${(0, devkit_1.joinPathFragments)(path.replace((0, path_1.dirname)(modulePath), ''), !isFlat ? name : '', `${fileName}`)}`;
    relativePath = relativePath.startsWith('/')
        ? `.${relativePath}`
        : `./${relativePath}`;
    const moduleContents = tree.read(modulePath, 'utf-8');
    const source = tsModule.createSourceFile(modulePath, moduleContents, tsModule.ScriptTarget.Latest, true);
    (0, js_1.insertImport)(tree, source, modulePath, className, relativePath);
    (0, insert_ngmodule_import_1.insertNgModuleProperty)(tree, modulePath, className, ngModuleProperty);
    if (isExported) {
        (0, insert_ngmodule_import_1.insertNgModuleProperty)(tree, modulePath, className, 'exports');
    }
}
