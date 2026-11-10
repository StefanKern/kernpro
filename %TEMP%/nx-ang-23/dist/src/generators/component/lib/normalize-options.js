"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const selector_1 = require("../../utils/selector");
const validations_1 = require("../../utils/validations");
const version_utils_1 = require("../../utils/version-utils");
async function normalizeOptions(tree, options) {
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    const { artifactName: name, directory, fileName, filePath, project: projectName, } = await (0, internal_1.determineArtifactNameAndDirectoryOptions)(tree, {
        name: options.name,
        path: options.path,
        suffix: options.type,
        allowedFileExtensions: ['ts'],
        fileExtension: 'ts',
    });
    if (name.includes('/')) {
        throw new Error(`The component name '${name}' cannot contain a slash as it must be a valid JS symbol. Please use a different name.`);
    }
    const { className } = (0, devkit_1.names)(name);
    const suffixClassName = options.type ? (0, devkit_1.names)(options.type).className : '';
    const symbolName = `${className}${suffixClassName}`;
    (0, validations_1.validateClassName)(symbolName);
    const { prefix, root, sourceRoot } = (0, devkit_1.readProjectConfiguration)(tree, projectName);
    const selector = options.selector ?? (0, selector_1.buildSelector)(name, options.prefix, prefix, 'fileName');
    (0, selector_1.validateHtmlSelector)(selector);
    return {
        ...options,
        name,
        projectName,
        changeDetection: options.changeDetection ??
            (angularMajorVersion >= 22 ? 'OnPush' : 'Default'),
        style: options.style ?? 'css',
        standalone: options.standalone ?? true,
        directory,
        fileName,
        filePath,
        symbolName,
        projectSourceRoot: sourceRoot,
        projectRoot: root,
        selector,
    };
}
