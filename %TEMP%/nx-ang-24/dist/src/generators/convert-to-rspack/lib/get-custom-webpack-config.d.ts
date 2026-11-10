import type { Tree } from '@nx/devkit';
export declare function getCustomWebpackConfig(tree: Tree, projectRoot: string, pathToCustomWebpackConfig: string): Promise<{
    isWebpackConfigFunction: boolean;
    normalizedPathToCustomWebpackConfig: string;
}>;
