import type { ExecutorContext } from '@nx/devkit';
import { type DependentBuildableProjectNode } from '@nx/js/internal';
import type { NgPackagr } from 'ng-packagr';
import type { BuildAngularLibraryExecutorOptions } from './schema';
/**
 * Creates an executor function that executes the library build of an Angular
 * package using ng-packagr.
 * @param initializeNgPackagr function that returns an ngPackagr instance to use for the build.
 */
export declare function createLibraryExecutor(initializeNgPackagr: (options: BuildAngularLibraryExecutorOptions, context: ExecutorContext, projectDependencies: DependentBuildableProjectNode[]) => Promise<NgPackagr>): (options: BuildAngularLibraryExecutorOptions, context: ExecutorContext) => AsyncGenerator<{
    success: boolean;
}, any, any>;
export declare const packageExecutor: (options: BuildAngularLibraryExecutorOptions, context: ExecutorContext) => AsyncGenerator<{
    success: boolean;
}, any, any>;
export default packageExecutor;
