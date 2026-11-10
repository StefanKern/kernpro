import { type ProjectConfiguration, type Tree } from '@nx/devkit';
export type ComponentMetadata = {
    fileName: string;
    extensionlessFileName: string;
    path: string;
    symbolName: string;
};
export declare function getAppComponentInfo(tree: Tree, componentFileSuffix: string, project: ProjectConfiguration): ComponentMetadata;
export declare function getNxWelcomeComponentInfo(tree: Tree, componentFileSuffix: string, project: ProjectConfiguration): ComponentMetadata;
