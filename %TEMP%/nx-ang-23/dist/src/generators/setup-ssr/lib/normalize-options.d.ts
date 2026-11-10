import { type Tree } from '@nx/devkit';
import type { NormalizedGeneratorOptions, Schema } from '../schema';
export declare function normalizeOptions(tree: Tree, options: Schema): Promise<NormalizedGeneratorOptions>;
