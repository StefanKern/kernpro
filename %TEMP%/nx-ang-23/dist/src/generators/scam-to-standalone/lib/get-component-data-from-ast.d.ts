import { type Tree } from '@nx/devkit';
export declare function getComponentDataFromAST(tree: Tree, normalizedComponentPath: string): {
    componentFileContents: string;
    componentAST: any;
    componentName: any;
};
