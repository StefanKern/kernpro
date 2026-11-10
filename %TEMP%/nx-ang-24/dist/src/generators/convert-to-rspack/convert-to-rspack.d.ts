import { type GeneratorCallback, type Tree } from '@nx/devkit';
import type { ConvertToRspackSchema } from './schema';
export declare function convertToRspack(tree: Tree, schema: ConvertToRspackSchema): Promise<GeneratorCallback>;
export default convertToRspack;
