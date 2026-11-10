import { type ExecutorContext } from '@nx/devkit';
import { type DependentBuildableProjectNode } from '@nx/js/internal';
export declare function createTmpTsConfigForBuildableLibs(tsConfigPath: string, context: ExecutorContext): {
    tsConfigPath: string;
    dependencies: DependentBuildableProjectNode[];
};
