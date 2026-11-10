import { GeneratorCallback, Tree } from '@nx/devkit';
import type { Schema } from './schema';
export declare function applicationGenerator(tree: Tree, schema: Schema): Promise<GeneratorCallback>;
export default applicationGenerator;
