import { type Tree } from '@nx/devkit';
export type AddJestOptions = {
    name: string;
    projectRoot: string;
    skipPackageJson: boolean;
    strict: boolean;
    runtimeTsconfigFileName: 'tsconfig.app.json' | 'tsconfig.lib.json';
    zoneless: boolean;
    addPlugin?: boolean;
};
export declare function addJest(tree: Tree, options: AddJestOptions): Promise<void>;
