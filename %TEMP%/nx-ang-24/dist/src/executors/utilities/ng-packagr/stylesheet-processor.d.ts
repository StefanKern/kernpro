/**
 * Adapted from the original ng-packagr source.
 *
 * Changes made:
 * - Add the project root to the search directories.
 */
import type { NgPackageEntryConfig } from 'ng-packagr/src/ng-entrypoint.schema';
export declare enum CssUrl {
    inline = "inline",
    none = "none"
}
export declare function getStylesheetProcessor(): new (projectBasePath: string, basePath: string, cssUrl?: CssUrl, includePaths?: string[], sass?: NgPackageEntryConfig['lib']['sass'], cacheDirectory?: string | false, watch?: boolean) => {
    [key: string]: any;
};
