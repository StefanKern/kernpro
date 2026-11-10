"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
async function default_1(tree) {
    let usesModuleFederation = false;
    (0, internal_1.forEachExecutorOptions)(tree, '@nx/angular:webpack-browser', (options) => {
        const webpackConfig = options.webpackConfig;
        if (!webpackConfig) {
            return;
        }
        const webpackContents = tree.read(webpackConfig, 'utf-8');
        if (['withModuleFederation', 'withModuleFederationForSSR'].some((p) => webpackContents.includes(p))) {
            usesModuleFederation = true;
        }
    });
    if (!usesModuleFederation) {
        return;
    }
    const nxJson = (0, devkit_1.readNxJson)(tree) ?? {};
    const nxMFDevRemotesEnvVar = 'NX_MF_DEV_REMOTES';
    const webpackExecutor = '@nx/angular:webpack-browser';
    const defaultInputs = [
        ...(nxJson.namedInputs && 'production' in nxJson.namedInputs
            ? ['production', '^production']
            : ['default', '^default']),
        { env: nxMFDevRemotesEnvVar },
    ];
    const existing = (0, internal_1.findTargetDefault)(nxJson.targetDefaults, {
        executor: webpackExecutor,
    });
    if (!existing) {
        (0, internal_1.upsertTargetDefault)(tree, nxJson, {
            executor: webpackExecutor,
            cache: true,
            inputs: defaultInputs,
            dependsOn: ['^build'],
        });
    }
    else {
        const dependsOn = [...(existing.dependsOn ?? [])];
        if (!dependsOn.includes('^build'))
            dependsOn.push('^build');
        const inputs = [...(existing.inputs ?? [])];
        if (!inputs.find((i) => typeof i === 'string' ? false : i['env'] === nxMFDevRemotesEnvVar)) {
            inputs.push({ env: nxMFDevRemotesEnvVar });
        }
        (0, internal_1.upsertTargetDefault)(tree, nxJson, {
            executor: webpackExecutor,
            ...(existing.cache !== undefined ? { cache: existing.cache } : {}),
            inputs,
            dependsOn,
        });
    }
    (0, devkit_1.updateNxJson)(tree, nxJson);
    await (0, devkit_1.formatFiles)(tree);
}
