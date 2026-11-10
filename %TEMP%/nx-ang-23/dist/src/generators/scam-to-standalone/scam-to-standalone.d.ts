import type { Tree } from '@nx/devkit';
import type { Schema } from './schema';
/**
 * @deprecated SCAMs are superseded by Angular standalone components. Convert any remaining SCAMs before upgrading. It will be removed in Nx v24.
 */
export declare function scamToStandalone(tree: Tree, { component, project: projectName, skipFormat }: Schema): Promise<void>;
export default scamToStandalone;
