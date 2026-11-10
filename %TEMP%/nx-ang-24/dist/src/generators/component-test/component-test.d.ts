import { type GeneratorCallback, type Tree } from '@nx/devkit';
import type { ComponentTestSchema } from './schema';
export declare function componentTestGenerator(tree: Tree, options: ComponentTestSchema): Promise<GeneratorCallback>;
export default componentTestGenerator;
