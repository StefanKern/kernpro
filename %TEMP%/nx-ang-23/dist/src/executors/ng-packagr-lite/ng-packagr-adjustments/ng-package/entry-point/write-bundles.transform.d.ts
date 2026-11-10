/**
 * Adapted from the original ng-packagr.
 *
 * Changes made:
 * - Removed bundling altogether.
 * - Write the ESM2022 outputs to the file system.
 * - Fake the FESM2022 outputs pointing them to the ESM2022 outputs.
 */
import type { NgPackagrOptions } from 'ng-packagr/src/lib/ng-package/options.di';
import { type NgEntryPointType } from './entry-point';
export declare const writeBundlesTransform: (_options: NgPackagrOptions) => import("ng-packagr/src/lib/graph/transform").Transform;
export declare function removeSourceMappingUrl(content: string): string;
export declare function remapDeclarationMapSources(originalPath: string, newPath: string, content: string): string;
export declare function normalizeEsm2022Path(path: string, entryPoint: NgEntryPointType): string;
