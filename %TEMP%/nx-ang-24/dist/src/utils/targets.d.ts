import type { ProjectConfiguration, Target, TargetConfiguration } from '@nx/devkit';
export declare function allProjectTargets<T>(project: ProjectConfiguration): Iterable<[name: string, target: TargetConfiguration<T>]>;
export declare function allTargetOptions<T>(target: TargetConfiguration<T>): Iterable<[string | undefined, T]>;
/**
 * Return a Target tuple from a specifier string.
 * Supports abbreviated target specifiers (examples: `::`, `::development`, or `:build:production`).
 */
export declare function targetFromTargetString(specifier: string, abbreviatedProjectName?: string, abbreviatedTargetName?: string): Target;
