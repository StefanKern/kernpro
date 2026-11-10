import { type GeneratorCallback, type Tree } from '@nx/devkit';
export type AddVitestAngularOptions = {
    name: string;
    projectRoot: string;
    skipPackageJson: boolean;
    useNxUnitTestRunnerExecutor?: boolean;
};
export type AddVitestAnalogOptions = {
    name: string;
    projectRoot: string;
    skipFormat: boolean;
    skipPackageJson: boolean;
    strict: boolean;
    zoneless: boolean;
    addPlugin?: boolean;
};
export declare function addVitestAngular(tree: Tree, options: AddVitestAngularOptions): Promise<GeneratorCallback>;
export declare function addVitestAnalog(tree: Tree, options: AddVitestAnalogOptions): Promise<GeneratorCallback>;
