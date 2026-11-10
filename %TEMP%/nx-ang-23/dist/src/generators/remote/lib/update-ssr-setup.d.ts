import type { Tree } from '@nx/devkit';
export declare function updateSsrSetup(tree: Tree, { appName, port, standalone, typescriptConfiguration, zoneless, skipPackageJson, }: {
    appName: string;
    port: number;
    standalone: boolean;
    typescriptConfiguration: boolean;
    zoneless: boolean;
    skipPackageJson?: boolean;
}): Promise<import("@nx/devkit").GeneratorCallback>;
