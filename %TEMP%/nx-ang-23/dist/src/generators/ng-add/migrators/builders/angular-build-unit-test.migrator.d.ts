import type { ProjectConfiguration, Tree } from '@nx/devkit';
import type { Logger, ProjectMigrationInfo } from '../../utilities';
import { BuilderMigrator } from './builder.migrator';
export declare class AngularBuildUnitTestMigrator extends BuilderMigrator {
    constructor(tree: Tree, project: ProjectMigrationInfo, projectConfig: ProjectConfiguration, logger: Logger);
    migrate(): void;
    private moveConfigFiles;
    private moveCustomReporterFiles;
    private updateTargetConfiguration;
    private updateConfigurationOptions;
    private updateReporterPaths;
    private updateTsConfigFileUsedByTestTarget;
    private handleRootProjectConfigFiles;
    private getRunnerOption;
}
