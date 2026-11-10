"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const artifact_types_1 = require("../../utils/artifact-types");
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
    const moduleTypeSeparator = (0, artifact_types_1.getModuleTypeSeparator)(tree);
    const modulePath = (0, devkit_1.joinPathFragments)(directory, `${name}${moduleTypeSeparator}module.ts`);
    return {
        ...options,
        export: options.export ?? true,
        inlineScam: options.inlineScam ?? true,
        directory,
        fileName,
        filePath,
        name,
        symbolName,
        projectName,
        modulePath,
    };
}
