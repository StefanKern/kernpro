"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const selector_1 = require("../../utils/selector");
const validations_1 = require("../../utils/validations");
async function normalizeOptions(tree, options) {
    const { artifactName: name, directory, fileName, filePath, project: projectName, } = await (0, internal_1.determineArtifactNameAndDirectoryOptions)(tree, {
        name: options.name,
        path: options.path,
        suffix: options.type,
        allowedFileExtensions: ['ts'],
        fileExtension: 'ts',
    });
    const { className } = (0, devkit_1.names)(name);
    const suffixClassName = options.type ? (0, devkit_1.names)(options.type).className : '';
    const symbolName = `${className}${suffixClassName}`;
    (0, validations_1.validateClassName)(symbolName);
    const { prefix } = (0, devkit_1.readProjectConfiguration)(tree, projectName);
    const selector = options.selector ??
        (0, selector_1.buildSelector)(name, options.prefix, prefix, 'propertyName');
    (0, selector_1.validateHtmlSelector)(selector);
    return {
        ...options,
        projectName,
        name,
        directory,
        fileName,
        filePath,
        symbolName,
        selector,
        standalone: options.standalone ?? true,
    };
}
