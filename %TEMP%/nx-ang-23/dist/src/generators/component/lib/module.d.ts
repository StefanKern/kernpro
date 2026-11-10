import type { Tree } from '@nx/devkit';
export type ModuleOptions = {
    directory: string;
    module?: string;
    moduleExt?: string;
    routingModuleExt?: string;
};
export declare function findModuleFromOptions(tree: Tree, options: ModuleOptions, projectRoot: string): string;
