import * as latestVersions from './versions';
export declare const supportedVersions: readonly [22, 21, 20];
export type SupportedVersion = (typeof supportedVersions)[number];
export type PackageVersionNames = Exclude<keyof typeof latestVersions, 'nxVersion'>;
export type VersionMap = {
    22: Record<PackageVersionNames, string>;
    21: Record<PackageVersionNames, string>;
    20: Record<PackageVersionNames, string>;
};
export type PackageCompatVersions = VersionMap[SupportedVersion];
export declare const backwardCompatibleVersions: VersionMap;
