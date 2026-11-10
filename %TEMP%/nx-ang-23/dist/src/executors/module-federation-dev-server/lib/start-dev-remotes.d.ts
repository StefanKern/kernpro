import { type Schema } from '../schema';
import { type ExecutorContext, type ProjectConfiguration } from '@nx/devkit';
export declare function startRemotes(remotes: string[], workspaceProjects: Record<string, ProjectConfiguration>, options: Pick<Schema, 'devRemotes' | 'verbose'>, context: ExecutorContext, target?: 'serve' | 'serve-static'): Promise<AsyncIterable<{
    success: boolean;
}>[]>;
