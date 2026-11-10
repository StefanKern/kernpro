import { type ServerAddress } from '@nx/devkit/internal';
import type { AngularProjectConfiguration } from '../plugin';
export interface AngularWorkspace {
    projects?: Record<string, AngularProjectConfiguration>;
}
/**
 * Where the dev server of the task's `ng serve` or `ng run` command listens,
 * resolved the way the Angular CLI and the target's builder resolve it, or
 * null when nothing can be probed.
 */
export declare function getDevServerAddress(options: Record<string, unknown>, workspace: AngularWorkspace, root: string): ServerAddress | null;
/**
 * The readyWhen of the inferred dev server targets. Runs in the env and with
 * the options of the task, resolves the target its `ng` command runs from the
 * workspace config, and waits for the dev server's port.
 */
export declare function waitForAngularDevServer(workspaceConfigPath: string): Promise<void>;
