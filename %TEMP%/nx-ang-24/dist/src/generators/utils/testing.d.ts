import type { Tree } from '@nx/devkit';
import type { Schema as ApplicationOptions } from '../application/schema';
import type { Schema as LibraryOptions } from '../library/schema';
export declare function generateTestApplication(tree: Tree, options: ApplicationOptions): Promise<void>;
export declare function generateTestLibrary(tree: Tree, options: LibraryOptions): Promise<void>;
export declare function createStorybookTestWorkspaceForLib(libName: string): Promise<Tree>;
export declare function generateTestInlineScam(tree: Tree, options: {
    name: string;
    path: string;
}): Promise<void>;
