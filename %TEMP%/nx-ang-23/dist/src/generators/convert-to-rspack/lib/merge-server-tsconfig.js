"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeServerTsConfig = mergeServerTsConfig;
const devkit_1 = require("@nx/devkit");
const posix_1 = require("path/posix");
const constants_1 = require("../../setup-ssr/lib/constants");
const tsconfig_utils_1 = require("../../utils/tsconfig-utils");
/**
 * Folds the tsconfig the server builder used into every tsconfig the rspack
 * build compiles with. The rspack build compiles the browser and the server
 * bundles from a single tsconfig, so the server sources have to be part of it.
 * The server tsconfig is then deleted, unless a build target also points at it.
 */
function mergeServerTsConfig(tree, projectRoot, serverTsConfigPath, buildTsConfigPaths) {
    if (!tree.exists(serverTsConfigPath)) {
        return;
    }
    const serverTsConfig = (0, tsconfig_utils_1.readResolvedTsConfig)(tree, serverTsConfigPath);
    const serverTsConfigDir = (0, posix_1.dirname)(serverTsConfigPath);
    // entries in each tsconfig are relative to it, so compare them from the
    // workspace root and write them back relative to the tsconfig receiving them
    const serverEntries = (serverTsConfig.raw.files ?? []).map((file) => (0, devkit_1.joinPathFragments)(serverTsConfigDir, file));
    const serverSources = new Set([
        ...serverEntries,
        // excluded alongside the server entries, and reachable from them
        (0, devkit_1.joinPathFragments)(projectRoot, constants_1.SERVER_APP_CONFIG_FILE),
    ]);
    for (const buildTsConfigPath of buildTsConfigPaths) {
        // the server entries come from this tsconfig, so folding it into itself
        // would only rewrite what it already declares
        if (buildTsConfigPath === serverTsConfigPath ||
            !tree.exists(buildTsConfigPath)) {
            continue;
        }
        const buildTsConfigDir = (0, posix_1.dirname)(buildTsConfigPath);
        (0, devkit_1.updateJson)(tree, buildTsConfigPath, (json) => {
            if (json.exclude) {
                json.exclude = json.exclude.filter((pattern) => !serverSources.has((0, devkit_1.joinPathFragments)(buildTsConfigDir, pattern)));
            }
            return json;
        });
        // `files`, `include`, `exclude` and `types` are all inherited through
        // `extends`, so what the build tsconfig compiles is only visible with the
        // chain applied, and the entries it contributes have to be kept when this
        // config takes them over
        const { raw, options } = (0, tsconfig_utils_1.readResolvedTsConfig)(tree, buildTsConfigPath);
        // `exclude` cannot drop a `files` entry, so list the server sources instead
        // of working out whether the config's globs already reach them. A config
        // declaring none of the three takes everything beside it, which already
        // covers entries sitting there.
        const mustListServerEntries = !!raw.files ||
            !!raw.include ||
            !!raw.exclude ||
            serverEntries.some((entry) => (0, posix_1.relative)(buildTsConfigDir, entry).startsWith('../'));
        const types = new Set([
            ...(options.types ?? []),
            ...(serverTsConfig.options.types ?? []),
        ]);
        (0, devkit_1.updateJson)(tree, buildTsConfigPath, (json) => {
            if (mustListServerEntries) {
                const inheritedEntries = (raw.files ?? []).map((file) => (0, devkit_1.joinPathFragments)(buildTsConfigDir, file));
                json.files = Array.from(new Set([...inheritedEntries, ...serverEntries])).map((entry) => (0, posix_1.relative)(buildTsConfigDir, entry));
            }
            if (types.size) {
                json.compilerOptions ??= {};
                json.compilerOptions.types = Array.from(types);
            }
            return json;
        });
    }
    // a build target or one of its configurations can point at the tsconfig the
    // server target used, and the rspack build still compiles with it
    if (buildTsConfigPaths.has(serverTsConfigPath)) {
        return;
    }
    tree.delete(serverTsConfigPath);
    const projectTsConfigPath = (0, devkit_1.joinPathFragments)(projectRoot, 'tsconfig.json');
    if (!tree.exists(projectTsConfigPath)) {
        return;
    }
    (0, devkit_1.updateJson)(tree, projectTsConfigPath, (json) => {
        if (json.references) {
            json.references = json.references.filter((reference) => (0, devkit_1.joinPathFragments)(projectRoot, reference.path) !==
                serverTsConfigPath &&
                // setups generated before the reference path was corrected wrote it
                // relative to the workspace root
                reference.path !== serverTsConfigPath);
        }
        return json;
    });
}
