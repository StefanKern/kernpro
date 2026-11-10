import type { Tree } from '@nx/devkit';
import type * as ts from 'typescript';
/**
 * Gets the resolved value of a specific compiler option from the TypeScript configuration hierarchy.
 *
 * @param tree - The file system tree
 * @param tsConfigPath - Path to the tsconfig file to resolve
 * @param optionName - Name of the compiler option to retrieve
 * @returns The resolved value of the compiler option, or undefined if not set
 */
export declare function getDefinedCompilerOption(tree: Tree, tsConfigPath: string, optionName: keyof ts.CompilerOptions): any | undefined;
/**
 * Reads a tsconfig with its `extends` chain applied. The `files`, `include` and
 * `exclude` entries come back relative to `tsConfigPath` no matter which config
 * in the chain declared them.
 */
export declare function readResolvedTsConfig(tree: Tree, tsConfigPath: string): ts.ParsedCommandLine;
export declare function readCompilerOptionsFromTsConfig(tree: Tree, tsConfigPath: string): ts.CompilerOptions;
