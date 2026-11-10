"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const test_runners_1 = require("../../../utils/test-runners");
const artifact_types_1 = require("../../utils/artifact-types");
const version_utils_1 = require("../../utils/version-utils");
const internal_2 = require("@nx/js/internal");
async function normalizeOptions(host, schema) {
    schema.standalone = schema.standalone ?? true;
    // Create a schema with populated default values
    // No `linter` default here: it would mask the resolution below, which is what
    // detects the workspace's linter and prompts when there is nothing to detect.
    const options = {
        buildable: false,
        publishable: false,
        skipFormat: false,
        // Publishable libs cannot use `full` yet, so if its false then use the passed value or default to `full`
        compilationMode: schema.publishable
            ? 'partial'
            : (schema.compilationMode ?? 'full'),
        skipModule: schema.skipModule || schema.standalone,
        ...schema,
    };
    await (0, internal_1.ensureRootProjectName)(options, 'library');
    const { projectName, names: projectNames, projectRoot, importPath, } = await (0, internal_1.determineProjectNameAndRootOptions)(host, {
        name: options.name,
        projectType: 'library',
        directory: options.directory,
        importPath: options.importPath,
    });
    const fileName = projectNames.projectFileName;
    const moduleName = `${(0, devkit_1.names)(fileName).className}Module`;
    const parsedTags = options.tags
        ? options.tags.split(',').map((s) => s.trim())
        : [];
    const moduleTypeSeparator = (0, artifact_types_1.getModuleTypeSeparator)(host);
    const modulePath = `${projectRoot}/src/lib/${fileName}${moduleTypeSeparator}module.ts`;
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(host);
    const unitTestRunner = options.unitTestRunner ??
        (angularMajorVersion >= 21 && (options.buildable || options.publishable)
            ? test_runners_1.UnitTestRunner.VitestAngular
            : angularMajorVersion >= 21
                ? test_runners_1.UnitTestRunner.VitestAnalog
                : test_runners_1.UnitTestRunner.Jest);
    const ngCliSchematicLibRoot = projectName;
    const allNormalizedOptions = {
        ...options,
        linter: await (0, internal_2.normalizeLinterOption)(host, options.linter),
        unitTestRunner,
        prefix: options.prefix ?? 'lib',
        name: projectName,
        projectRoot,
        entryFile: 'index',
        moduleName,
        modulePath,
        parsedTags,
        fileName,
        importPath,
        ngCliSchematicLibRoot,
        skipTests: unitTestRunner === 'none' ? true : options.skipTests,
        standaloneComponentName: `${(0, devkit_1.names)(projectNames.projectSimpleName).className}Component`,
        moduleTypeSeparator,
    };
    const { displayBlock, inlineStyle, inlineTemplate, viewEncapsulation, changeDetection, style, skipTests, selector, skipSelector, flat, ...libraryOptions } = allNormalizedOptions;
    const componentType = (0, artifact_types_1.getComponentType)(host);
    return {
        libraryOptions,
        componentOptions: {
            name: fileName,
            standalone: libraryOptions.standalone,
            displayBlock,
            inlineStyle,
            inlineTemplate,
            viewEncapsulation,
            changeDetection,
            style,
            skipTests,
            selector,
            skipSelector,
            flat,
            type: componentType,
        },
    };
}
