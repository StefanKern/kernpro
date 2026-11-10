import type { Tree } from '@nx/devkit';
import type { Schema } from './schema';
/**
 * @deprecated SCAMs are superseded by Angular standalone components. Use the `pipeGenerator` instead. It will be removed in Nx v24.
 */
export declare function scamPipeGenerator(tree: Tree, rawOptions: Schema): Promise<void>;
export default scamPipeGenerator;
