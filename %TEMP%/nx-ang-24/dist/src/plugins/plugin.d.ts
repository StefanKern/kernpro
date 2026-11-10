import { type CreateNodes } from '@nx/devkit';
export interface AngularPluginOptions {
    targetNamePrefix?: string;
}
type AngularTargetConfiguration = {
    builder: string;
    options?: Record<string, any>;
    configurations?: Record<string, any>;
    defaultConfiguration?: string;
};
export type AngularProjectConfiguration = {
    projectType: 'application' | 'library';
    root: string;
    sourceRoot?: string;
    architect?: Record<string, AngularTargetConfiguration>;
    targets?: Record<string, AngularTargetConfiguration>;
};
export declare const createNodes: CreateNodes<AngularPluginOptions>;
/**
 * @deprecated Use {@link createNodes} instead. This will be removed in Nx 24.
 */
export declare const createNodesV2: CreateNodes<AngularPluginOptions>;
export {};
