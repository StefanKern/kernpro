import type { SourceFile } from 'typescript';
export type IsHostRemoteConfigResult = 'host' | 'remote' | 'both' | false;
export declare function isHostRemoteConfig(sourceFile: SourceFile): IsHostRemoteConfigResult;
export declare function getRemotesFromHost(sourceFile: SourceFile): any[];
export declare function getExposedModulesFromRemote(sourceFile: SourceFile): any;
