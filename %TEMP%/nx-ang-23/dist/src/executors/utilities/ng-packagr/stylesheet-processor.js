"use strict";
/**
 * Adapted from the original ng-packagr source.
 *
 * Changes made:
 * - Add the project root to the search directories.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CssUrl = void 0;
exports.getStylesheetProcessor = getStylesheetProcessor;
const tslib_1 = require("tslib");
const devkit_1 = require("@nx/devkit");
const browserslist_1 = tslib_1.__importDefault(require("browserslist"));
const component_stylesheets_1 = require("ng-packagr/src/lib/styles/component-stylesheets");
const postcss_configuration_1 = require("ng-packagr/src/lib/styles/postcss-configuration");
const ng_packagr_version_1 = require("./ng-packagr-version");
var CssUrl;
(function (CssUrl) {
    CssUrl["inline"] = "inline";
    CssUrl["none"] = "none";
})(CssUrl || (exports.CssUrl = CssUrl = {}));
function getStylesheetProcessor() {
    const { major: ngPackagrMajorVersion } = (0, ng_packagr_version_1.getNgPackagrVersionInfo)();
    class StylesheetProcessor extends component_stylesheets_1.ComponentStylesheetBundler {
        constructor(projectBasePath, basePath, cssUrl, includePaths, sass, cacheDirectory, watch) {
            if (ngPackagrMajorVersion === 22) {
                browserslist_1.default.defaults = ['baseline widely available on 2026-05-07'];
            }
            else if (ngPackagrMajorVersion === 21) {
                browserslist_1.default.defaults = ['baseline widely available on 2025-10-20'];
            }
            else if (ngPackagrMajorVersion === 20) {
                browserslist_1.default.defaults = (0, browserslist_1.default)(undefined, {
                    path: require.resolve('ng-packagr/.browserslistrc'),
                });
            }
            const browserslistData = (0, browserslist_1.default)(undefined, { path: basePath });
            let searchDirs = (0, postcss_configuration_1.generateSearchDirectories)([projectBasePath]);
            const postcssConfiguration = (0, postcss_configuration_1.loadPostcssConfiguration)(searchDirs);
            // (nx-specific): we support loading the TailwindCSS config from the root of the workspace
            searchDirs = (0, postcss_configuration_1.generateSearchDirectories)([projectBasePath, devkit_1.workspaceRoot]);
            super({
                cacheDirectory: cacheDirectory,
                postcssConfiguration: postcssConfiguration,
                tailwindConfiguration: postcssConfiguration
                    ? undefined
                    : (0, postcss_configuration_1.getTailwindConfig)(searchDirs, projectBasePath),
                sass: sass,
                workspaceRoot: projectBasePath,
                cssUrl: cssUrl,
                target: transformSupportedBrowsersToTargets(browserslistData),
                includePaths: includePaths,
            }, 'css', watch);
            this.projectBasePath = projectBasePath;
            this.basePath = basePath;
            this.cssUrl = cssUrl;
            this.includePaths = includePaths;
            this.sass = sass;
            this.cacheDirectory = cacheDirectory;
            this.watch = watch;
        }
        destroy() {
            void super.dispose();
        }
    }
    return StylesheetProcessor;
}
function transformSupportedBrowsersToTargets(supportedBrowsers) {
    const transformed = [];
    // https://esbuild.github.io/api/#target
    const esBuildSupportedBrowsers = new Set([
        'safari',
        'firefox',
        'edge',
        'chrome',
        'ios',
    ]);
    for (const browser of supportedBrowsers) {
        let [browserName, version] = browser.split(' ');
        // browserslist uses the name `ios_saf` for iOS Safari whereas esbuild uses `ios`
        if (browserName === 'ios_saf') {
            browserName = 'ios';
        }
        // browserslist uses ranges `15.2-15.3` versions but only the lowest is required
        // to perform minimum supported feature checks. esbuild also expects a single version.
        [version] = version.split('-');
        if (esBuildSupportedBrowsers.has(browserName)) {
            if (browserName === 'safari' && version === 'tp') {
                // esbuild only supports numeric versions so `TP` is converted to a high number (999) since
                // a Technology Preview (TP) of Safari is assumed to support all currently known features.
                version = '999';
            }
            transformed.push(browserName + version);
        }
    }
    return transformed.length ? transformed : undefined;
}
