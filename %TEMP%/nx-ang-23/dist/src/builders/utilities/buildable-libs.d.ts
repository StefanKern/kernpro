import { DependentBuildableProjectNode } from '@nx/js/internal';
import { ProjectGraph } from '@nx/devkit';
export declare function createTmpTsConfigForBuildableLibs(tsConfigPath: string, context: import('@angular-devkit/architect').BuilderContext, options?: {
    projectGraph?: ProjectGraph;
    target?: string;
}): {
    tsConfigPath: string;
    dependencies: DependentBuildableProjectNode[];
};
