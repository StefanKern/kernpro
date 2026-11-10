import type { PackageCompatVersions, PackageVersionNames } from './backward-compatible-versions';
export declare function getPkgVersionForAngularMajorVersion(pkgVersionName: PackageVersionNames, angularMajorVersion: number): string;
export declare function getPkgVersionsForAngularMajorVersion(angularMajorVersion: number): PackageCompatVersions;
