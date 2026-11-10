"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPipeToScam = convertPipeToScam;
const js_1 = require("@nx/js");
const internal_1 = require("@nx/js/internal");
let tsModule;
function convertPipeToScam(tree, options) {
    if (!tree.exists(options.filePath)) {
        throw new Error(`Couldn't find pipe at path ${options.filePath} to add SCAM setup.`);
    }
    if (!tsModule) {
        tsModule = (0, internal_1.ensureTypescript)();
    }
    if (options.inlineScam) {
        const currentPipeContents = tree.read(options.filePath, 'utf-8');
        let source = tsModule.createSourceFile(options.filePath, currentPipeContents, tsModule.ScriptTarget.Latest, true);
        source = (0, js_1.insertImport)(tree, source, options.filePath, 'NgModule', '@angular/core');
        source = (0, js_1.insertImport)(tree, source, options.filePath, 'CommonModule', '@angular/common');
        let updatedPipeSource = source.getText();
        updatedPipeSource = `${updatedPipeSource}${getNgModuleDeclaration(options.symbolName)}`;
        tree.write(options.filePath, updatedPipeSource);
        return;
    }
    tree.write(options.modulePath, getModuleFileContent(options.symbolName, options.fileName));
}
function getModuleFileContent(pipeClassName, pipeFileName) {
    return `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${pipeClassName} } from './${pipeFileName}';
${getNgModuleDeclaration(pipeClassName)}`;
}
function getNgModuleDeclaration(pipeClassName) {
    return `
@NgModule({
  imports: [CommonModule],
  declarations: [${pipeClassName}],
  exports: [${pipeClassName}],
})
export class ${pipeClassName}Module {}
`;
}
