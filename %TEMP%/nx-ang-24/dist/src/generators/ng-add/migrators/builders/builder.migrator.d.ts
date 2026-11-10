import type { ProjectConfiguration, TargetConfiguration, Tree } from '@nx/devkit';
import type { Logger, ProjectMigrationInfo, ValidationResult, WorkspaceRootFileType } from '../../utilities';
import { Migrator } from '../migrator';
export declare abstract class BuilderMigrator extends Migrator {
    readonly possibleBuilderNames: string[];
    readonly rootFileType: WorkspaceRootFileType | undefined;
    targets: Map<string, TargetConfiguration>;
    protected skipMigration: boolean;
    constructor(tree: Tree, possibleBuilderNames: string[], rootFileType: WorkspaceRootFileType | undefined, project: ProjectMigrationInfo, projectConfig: ProjectConfiguration, logger: Logger);
    validate(): ValidationResult;
    isBuilderUsed(): boolean;
    protected collectBuilderTargets(): void;
}
