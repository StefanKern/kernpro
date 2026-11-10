"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allProjectTargets = allProjectTargets;
exports.allTargetOptions = allTargetOptions;
exports.targetFromTargetString = targetFromTargetString;
function* allProjectTargets(project) {
    for (const name of Object.keys(project.targets ?? {})) {
        yield [name, project.targets[name]];
    }
}
function* allTargetOptions(target) {
    if (target.options) {
        yield [undefined, target.options];
    }
    if (!target.configurations) {
        return;
    }
    for (const name of Object.keys(target.configurations)) {
        const options = target.configurations[name];
        if (options !== undefined) {
            yield [name, options];
        }
    }
}
/**
 * Return a Target tuple from a specifier string.
 * Supports abbreviated target specifiers (examples: `::`, `::development`, or `:build:production`).
 */
function targetFromTargetString(specifier, abbreviatedProjectName, abbreviatedTargetName) {
    const tuple = specifier.split(':', 3);
    if (tuple.length < 2) {
        throw new Error('Invalid target string: ' + JSON.stringify(specifier));
    }
    return {
        project: tuple[0] || abbreviatedProjectName || '',
        target: tuple[1] || abbreviatedTargetName || '',
        ...(tuple[2] !== undefined && { configuration: tuple[2] }),
    };
}
