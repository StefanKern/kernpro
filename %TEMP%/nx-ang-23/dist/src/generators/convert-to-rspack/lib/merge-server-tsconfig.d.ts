import { type Tree } from '@nx/devkit';
/**
 * Folds the tsconfig the server builder used into every tsconfig the rspack
 * build compiles with. The rspack build compiles the browser and the server
 * bundles from a single tsconfig, so the server sources have to be part of it.
 * The server tsconfig is then deleted, unless a build target also points at it.
 */
export declare function mergeServerTsConfig(tree: Tree, projectRoot: string, serverTsConfigPath: string, buildTsConfigPaths: Set<string>): void;
