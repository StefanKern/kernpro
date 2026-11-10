import { type Tree } from '@nx/devkit';
import { type PackageCompatVersions, type SupportedVersion, supportedVersions, type VersionMap } from '../../utils/backward-compatible-versions';
export declare function getInstalledAngularDevkitVersion(tree: Tree): string | null;
export declare function getInstalledAngularVersion(tree: Tree): string;
export declare function getInstalledAngularMajorVersion(tree: Tree): number;
export declare function getInstalledAngularVersionInfo(tree: Tree): {
    version: string;
    major: number;
};
export declare function getInstalledPackageVersionInfo(tree: Tree, pkgName: string): {
    major: number;
    version: string;
};
/**
 * Whether every `@angular/ssr` version the workspace can end up with accepts
 * an allowed hosts configuration. The application engine and `CommonEngine`
 * validate the request host against it, and an unset allowlist matches nothing.
 */
export declare function supportsSsrAllowedHosts(tree: Tree): boolean;
/**
 * Raises the floor of an `@angular/ssr` version range to the first version in
 * it that accepts an allowed hosts configuration, so the scaffolded setup can
 * use the option no matter how the range is resolved. The range is returned
 * unchanged when every version it allows already accepts one, when no version
 * in it does, and when raising it would change the release lines it covers.
 */
export declare function withSsrAllowedHostsSupport(range: string): string;
export declare function versions(tree: Tree): PackageCompatVersions;
export declare function versions<V extends SupportedVersion>(tree: Tree, options: {
    minAngularMajorVersion: V;
}): MinVersionReturnType<V>;
type TakeUntil<Arr extends readonly any[], Target> = Arr extends readonly [
    infer Head,
    ...infer Rest
] ? Head extends Target ? [Head] : [Head, ...TakeUntil<Rest, Target>] : [];
type VersionsAtLeast<MinV extends SupportedVersion> = Extract<SupportedVersion, TakeUntil<typeof supportedVersions, MinV>[number]>;
type MinVersionReturnType<MinV extends SupportedVersion> = VersionMap[VersionsAtLeast<MinV>];
export {};
