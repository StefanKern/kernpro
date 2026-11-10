"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const validations_1 = require("../../utils/validations");
async function normalizeOptions(tree, options) {
    options.typeSeparator ??= '-';
    const { artifactName: name, directory, fileName, filePath, project: projectName, } = await (0, internal_1.determineArtifactNameAndDirectoryOptions)(tree, {
        name: options.name,
        path: options.path,
        suffix: 'pipe',
        suffixSeparator: options.typeSeparator,
        allowedFileExtensions: ['ts'],
        fileExtension: 'ts',
    });
    const { className } = (0, devkit_1.names)(name);
    const { className: suffixClassName } = (0, devkit_1.names)('pipe');
    const symbolName = `${className}${suffixClassName}`;
    (0, validations_1.validateClassName)(symbolName);
    return {
        ...options,
        projectName,
        name,
        directory,
        fileName,
        filePath,
        symbolName,
        standalone: options.standalone ?? true,
    };
}
