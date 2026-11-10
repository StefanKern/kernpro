import { NgEntryPoint as NgEntryPointBase } from 'ng-packagr/src/lib/ng-package/entry-point/entry-point';
import type { NgPackageConfig } from 'ng-packagr/src/ng-package.schema';
export type NgEntryPointType = NgEntryPointBase & {
    primaryDestinationPath?: string;
};
export declare function createNgEntryPoint(packageJson: Record<string, any>, ngPackageJson: NgPackageConfig, basePath: string, secondaryData?: Record<string, any>): NgEntryPointType;
