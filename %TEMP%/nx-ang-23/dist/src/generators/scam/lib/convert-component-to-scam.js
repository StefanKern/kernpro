"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertComponentToScam = convertComponentToScam;
const js_1 = require("@nx/js");
const internal_1 = require("@nx/js/internal");
let tsModule;
function convertComponentToScam(tree, options) {
    if (!tree.exists(options.filePath)) {
        throw new Error(`Couldn't find component at path ${options.filePath} to add SCAM setup.`);
    }
    if (!tsModule) {
        tsModule = (0, internal_1.ensureTypescript)();
    }
    if (options.inlineScam) {
        const currentComponentContents = tree.read(options.filePath, 'utf-8');
        let source = tsModule.createSourceFile(options.filePath, currentComponentContents, tsModule.ScriptTarget.Latest, true);
        source = (0, js_1.insertImport)(tree, source, options.filePath, 'NgModule', '@angular/core');
        source = (0, js_1.insertImport)(tree, source, options.filePath, 'CommonModule', '@angular/common');
        let updatedComponentSource = source.getText();
        updatedComponentSource = `${updatedComponentSource}${getNgModuleDeclaration(options.symbolName)}`;
        tree.write(options.filePath, updatedComponentSource);
        return;
    }
    tree.write(options.modulePath, getModuleFileContent(options.symbolName, options.fileName));
}
function getModuleFileContent(componentClassName, componentFileName) {
    return `import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ${componentClassName} } from './${componentFileName}';
${getNgModuleDeclaration(componentClassName)}`;
}
function getNgModuleDeclaration(componentClassName) {
    return `
@NgModule({
  imports: [CommonModule],
  declarations: [${componentClassName}],
  exports: [${componentClassName}],
})
export class ${componentClassName}Module {}
`;
}
