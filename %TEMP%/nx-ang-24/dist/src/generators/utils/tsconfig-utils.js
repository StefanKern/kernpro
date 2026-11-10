"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefinedCompilerOption = getDefinedCompilerOption;
exports.readResolvedTsConfig = readResolvedTsConfig;
exports.readCompilerOptionsFromTsConfig = readCompilerOptionsFromTsConfig;
const internal_1 = require("@nx/js/internal");
const node_path_1 = require("node:path");
/**
 * Gets the resolved value of a specific compiler option from the TypeScript configuration hierarchy.
 *
 * @param tree - The file system tree
 * @param tsConfigPath - Path to the tsconfig file to resolve
 * @param optionName - Name of the compiler option to retrieve
 * @returns The resolved value of the compiler option, or undefined if not set
 */
function getDefinedCompilerOption(tree, tsConfigPath, optionName) {
    const compilerOptions = readCompilerOptionsFromTsConfig(tree, tsConfigPath);
    return compilerOptions[optionName];
}
/**
 * Reads a tsconfig with its `extends` chain applied. The `files`, `include` and
 * `exclude` entries come back relative to `tsConfigPath` no matter which config
 * in the chain declared them.
 */
function readResolvedTsConfig(tree, tsConfigPath) {
    const ts = (0, internal_1.ensureTypescript)();
    const host = (0, internal_1.createTreeParseConfigHost)(tree);
    // an absolute path is what makes the inherited entries come back relative to
    // this config
    const absoluteTsConfigPath = (0, node_path_1.join)(tree.root, tsConfigPath);
    return ts.parseJsonConfigFileContent(ts.readConfigFile(absoluteTsConfigPath, host.readFile).config, host, (0, node_path_1.dirname)(absoluteTsConfigPath));
}
function readCompilerOptionsFromTsConfig(tree, tsConfigPath) {
    const ts = (0, internal_1.ensureTypescript)();
    const host = (0, internal_1.createTreeParseConfigHost)(tree);
    const parsed = ts.parseJsonConfigFileContent(ts.readConfigFile(tsConfigPath, host.readFile).config, host, (0, node_path_1.dirname)(tsConfigPath));
    return parsed.options;
}
