"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addMfEnvToTargetDefaultInputs = addMfEnvToTargetDefaultInputs;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
function addMfEnvToTargetDefaultInputs(tree) {
    const nxJson = (0, devkit_1.readNxJson)(tree) ?? {};
    const webpackExecutor = '@nx/angular:webpack-browser';
    const mfEnvVar = 'NX_MF_DEV_REMOTES';
    const defaultInputs = [
        ...(nxJson.namedInputs && 'production' in nxJson.namedInputs
            ? ['production', '^production']
            : ['default', '^default']),
    ];
    const existing = (0, internal_1.findTargetDefault)(nxJson.targetDefaults, {
        executor: webpackExecutor,
    });
    const inputs = [...(existing?.inputs ?? defaultInputs)];
    let mfEnvVarExists = false;
    for (const input of inputs) {
        if (typeof input === 'object' && input['env'] === mfEnvVar) {
            mfEnvVarExists = true;
            break;
        }
    }
    if (!mfEnvVarExists) {
        inputs.push({ env: mfEnvVar });
    }
    (0, internal_1.upsertTargetDefault)(tree, nxJson, {
        executor: webpackExecutor,
        cache: true,
        inputs,
        dependsOn: existing?.dependsOn ?? ['^build'],
    });
    (0, devkit_1.updateNxJson)(tree, nxJson);
}
