"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNodesV2 = exports.createNodes = void 0;
const tslib_1 = require("tslib");
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const node_fs_1 = require("node:fs");
const node_path_1 = require("node:path");
const posix = tslib_1.__importStar(require("node:path/posix"));
const targets_1 = require("../utils/targets");
const vitest_1 = require("./utils/vitest");
const knownExecutors = {
    appShell: new Set(['@angular-devkit/build-angular:app-shell']),
    build: new Set([
        '@angular-devkit/build-angular:application',
        '@angular/build:application',
        '@angular-devkit/build-angular:browser-esbuild',
        '@angular-devkit/build-angular:browser',
        '@angular-devkit/build-angular:ng-packagr',
        '@angular/build:ng-packagr',
    ]),
    devServer: new Set([
        '@angular-devkit/build-angular:dev-server',
        '@angular/build:dev-server',
    ]),
    extractI18n: new Set([
        '@angular-devkit/build-angular:extract-i18n',
        '@angular/build:extract-i18n',
    ]),
    prerender: new Set([
        '@angular-devkit/build-angular:prerender',
        '@nguniversal/builders:prerender',
    ]),
    server: new Set(['@angular-devkit/build-angular:server']),
    serveSsr: new Set([
        '@angular-devkit/build-angular:ssr-dev-server',
        '@nguniversal/builders:ssr-dev-server',
    ]),
    test: new Set([
        '@angular-devkit/build-angular:karma',
        '@angular/build:karma',
        '@angular/build:unit-test',
    ]),
};
exports.createNodes = [
    '**/angular.json',
    async (configFiles, options, context) => {
        const optionsHash = (0, internal_1.hashObject)(options);
        const cachePath = (0, node_path_1.join)(internal_1.workspaceDataDirectory, `angular-${optionsHash}.hash`);
        const projectsCache = new internal_1.PluginCache(cachePath);
        const packageManager = (0, devkit_1.detectPackageManager)(context.workspaceRoot);
        const pmc = (0, devkit_1.getPackageManagerCommand)(packageManager);
        const lockFileName = (0, js_1.getLockFileName)(packageManager);
        try {
            const { entries, preErrors } = await filterAngularConfigs(configFiles, context);
            const projectHashes = await (0, internal_1.calculateHashesForCreateNodes)(entries.map((e) => e.angularWorkspaceRoot), options ?? {}, context, entries.map(() => [lockFileName]));
            let results = [];
            let nodeErrors = [];
            try {
                results = await (0, devkit_1.createNodesFromFiles)((configFile, opts, ctx, idx) => createNodesInternal(configFile, opts, ctx, projectsCache, pmc, projectHashes[idx]), entries.map((e) => e.configFile), options, context);
            }
            catch (e) {
                if (e instanceof devkit_1.AggregateCreateNodesError) {
                    results = e.partialResults ?? [];
                    nodeErrors = e.errors;
                }
                else {
                    throw e;
                }
            }
            const allErrors = [...preErrors, ...nodeErrors];
            if (allErrors.length > 0) {
                throw new devkit_1.AggregateCreateNodesError(allErrors, results);
            }
            return results;
        }
        finally {
            projectsCache.writeToDisk();
        }
    },
];
/**
 * @deprecated Use {@link createNodes} instead. This will be removed in Nx 24.
 */
exports.createNodesV2 = exports.createNodes;
async function createNodesInternal(configFilePath, options, context, projectsCache, pmc, hash) {
    const angularWorkspaceRoot = (0, node_path_1.dirname)(configFilePath);
    if (!projectsCache.has(hash)) {
        projectsCache.set(hash, await buildAngularProjects(configFilePath, options, angularWorkspaceRoot, context, pmc));
    }
    return { projects: projectsCache.get(hash) };
}
async function buildAngularProjects(configFilePath, options, angularWorkspaceRoot, context, pmc) {
    const projects = {};
    const absoluteConfigFilePath = (0, node_path_1.join)(context.workspaceRoot, configFilePath);
    const angularJson = (0, devkit_1.readJsonFile)(absoluteConfigFilePath);
    const appShellTargets = [];
    const prerenderTargets = [];
    for (const [projectName, project] of Object.entries(angularJson.projects ?? {})) {
        const targets = {};
        const projectTargets = getAngularJsonProjectTargets(project);
        if (!projectTargets) {
            continue;
        }
        const namedInputs = (0, internal_1.getNamedInputs)(project.root, context);
        for (const [angularTargetName, angularTarget] of Object.entries(projectTargets)) {
            const nxTargetName = options?.targetNamePrefix
                ? `${options.targetNamePrefix}${angularTargetName}`
                : angularTargetName;
            const externalDependencies = ['@angular/cli'];
            targets[nxTargetName] = {
                command: 
                // For targets that are also Angular CLI commands, infer the simplified form.
                // Otherwise, use `ng run` to support non-command targets so that they will run.
                angularTargetName === 'build' ||
                    angularTargetName === 'deploy' ||
                    angularTargetName === 'extract-i18n' ||
                    angularTargetName === 'e2e' ||
                    angularTargetName === 'lint' ||
                    angularTargetName === 'serve' ||
                    angularTargetName === 'test'
                    ? `ng ${angularTargetName}`
                    : `ng run ${projectName}:${angularTargetName}`,
                options: { cwd: angularWorkspaceRoot },
                metadata: {
                    technologies: ['angular'],
                    description: `Run the "${angularTargetName}" target for "${projectName}".`,
                    help: {
                        command: `${pmc.exec} ng run ${projectName}:${angularTargetName} --help`,
                        example: {},
                    },
                },
            };
            if (knownExecutors.appShell.has(angularTarget.builder)) {
                appShellTargets.push({ target: nxTargetName, project: projectName });
            }
            else if (knownExecutors.build.has(angularTarget.builder)) {
                await updateBuildTarget(projectName, nxTargetName, targets[nxTargetName], angularTarget, context, angularWorkspaceRoot, project.root, namedInputs);
            }
            else if (knownExecutors.devServer.has(angularTarget.builder)) {
                targets[nxTargetName].continuous = true;
                targets[nxTargetName].metadata.help.example.options = { port: 4201 };
            }
            else if (knownExecutors.extractI18n.has(angularTarget.builder)) {
                targets[nxTargetName].metadata.help.example.options = {
                    format: 'json',
                };
            }
            else if (knownExecutors.test.has(angularTarget.builder)) {
                await updateTestTarget(projectName, targets[nxTargetName], angularTarget, context, angularWorkspaceRoot, project.root, namedInputs, externalDependencies);
            }
            else if (knownExecutors.server.has(angularTarget.builder)) {
                updateServerTarget(targets[nxTargetName], angularTarget, context, angularWorkspaceRoot, project.root, namedInputs);
            }
            else if (knownExecutors.serveSsr.has(angularTarget.builder)) {
                targets[nxTargetName].continuous = true;
                targets[nxTargetName].metadata.help.example.options = { port: 4201 };
            }
            else if (knownExecutors.prerender.has(angularTarget.builder)) {
                prerenderTargets.push({ target: nxTargetName, project: projectName });
            }
            if (targets[nxTargetName].inputs?.length) {
                targets[nxTargetName].inputs.push({ externalDependencies });
            }
            if (angularTarget.configurations) {
                for (const configurationName of Object.keys(angularTarget.configurations)) {
                    targets[nxTargetName].configurations = {
                        ...targets[nxTargetName].configurations,
                        [configurationName]: {
                            command: `ng run ${projectName}:${angularTargetName}:${configurationName}`,
                        },
                    };
                }
            }
            if (angularTarget.defaultConfiguration) {
                targets[nxTargetName].defaultConfiguration =
                    angularTarget.defaultConfiguration;
            }
        }
        projects[projectName] = {
            projectType: project.projectType,
            root: posix.join(angularWorkspaceRoot, project.root),
            sourceRoot: project.sourceRoot
                ? posix.join(angularWorkspaceRoot, project.sourceRoot)
                : undefined,
            targets,
        };
    }
    for (const { project, target } of appShellTargets) {
        updateAppShellTarget(project, target, projects, angularJson, angularWorkspaceRoot, context);
    }
    for (const { project, target } of prerenderTargets) {
        updatePrerenderTarget(project, target, projects, angularJson);
    }
    return Object.entries(projects).reduce((acc, [projectName, project]) => {
        acc[project.root] = {
            projectType: project.projectType,
            sourceRoot: project.sourceRoot,
            targets: project.targets,
        };
        return acc;
    }, {});
}
function updateAppShellTarget(projectName, targetName, projects, angularJson, angularWorkspaceRoot, context) {
    // it must exist since we collected it when processing it
    const target = projects[projectName].targets[targetName];
    target.metadata.help.example.options = { route: '/some/route' };
    const { inputs, outputs } = getBrowserAndServerTargetInputsAndOutputs(projectName, targetName, projects, angularJson);
    const outputIndexPath = getAngularJsonProjectTargets(angularJson.projects[projectName])[targetName].options?.outputIndexPath;
    if (outputIndexPath) {
        const fullOutputIndexPath = (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot, outputIndexPath);
        outputs.push(getOutput(fullOutputIndexPath, context.workspaceRoot, angularWorkspaceRoot, angularJson.projects[projectName].root));
    }
    if (!outputs.length) {
        // no outputs were identified for the build or server target, so we don't
        // set any Nx cache options
        return;
    }
    target.cache = true;
    target.inputs = inputs;
    target.outputs = outputs;
}
async function updateBuildTarget(projectName, targetName, target, angularTarget, context, angularWorkspaceRoot, projectRoot, namedInputs) {
    target.dependsOn = [`^${targetName}`];
    if (angularTarget.builder === '@angular-devkit/build-angular:ng-packagr' ||
        angularTarget.builder === '@angular/build:ng-packagr') {
        const outputs = await getNgPackagrOutputs(angularTarget, angularWorkspaceRoot, projectRoot, context);
        if (outputs.length) {
            target.outputs = outputs;
        }
    }
    else {
        const fullOutputPath = (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot, angularTarget.options?.outputPath ?? posix.join('dist', projectName));
        target.outputs = [
            getOutput(fullOutputPath, context.workspaceRoot, angularWorkspaceRoot, projectRoot),
        ];
    }
    if (target.outputs?.length) {
        // make it cacheable if we were able to identify outputs
        target.cache = true;
        target.inputs =
            'production' in namedInputs
                ? ['production', '^production']
                : ['default', '^default'];
    }
    if (angularTarget.builder === '@angular-devkit/build-angular:ng-packagr' ||
        angularTarget.builder === '@angular/build:ng-packagr') {
        target.metadata.help.example.options = { watch: true };
    }
    else {
        target.metadata.help.example.options = { localize: true };
    }
}
async function updateTestTarget(projectName, target, angularTarget, context, angularWorkspaceRoot, projectRoot, namedInputs, externalDependencies) {
    target.cache = true;
    target.inputs =
        'production' in namedInputs
            ? ['default', '^production']
            : ['default', '^default'];
    const isKarmaRunner = angularTarget.builder === '@angular-devkit/build-angular:karma' ||
        angularTarget.builder === '@angular/build:karma' ||
        angularTarget.options?.runner === 'karma';
    if (isKarmaRunner) {
        target.outputs = getKarmaTargetOutputs(angularTarget, angularWorkspaceRoot, projectRoot, context);
        externalDependencies.push('karma');
    }
    else {
        target.outputs = await getVitestTargetOutputs(angularTarget, angularWorkspaceRoot, projectRoot, context);
        externalDependencies.push('vitest');
    }
    if (angularTarget.builder === '@angular/build:unit-test') {
        target.metadata.help.example.options = { coverage: true };
    }
    else {
        target.metadata.help.example.options = { codeCoverage: true };
    }
}
function updateServerTarget(target, angularTarget, context, angularWorkspaceRoot, projectRoot, namedInputs) {
    target.metadata.help.example.options = { localize: true };
    if (!angularTarget.options?.outputPath) {
        // only make it cacheable if we were able to identify outputs
        return;
    }
    target.cache = true;
    target.inputs =
        'production' in namedInputs
            ? ['production', '^production']
            : ['default', '^default'];
    const fullOutputPath = (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot, angularTarget.options.outputPath);
    target.outputs = [
        getOutput(fullOutputPath, context.workspaceRoot, angularWorkspaceRoot, projectRoot),
    ];
}
function updatePrerenderTarget(projectName, targetName, projects, angularJson) {
    // it must exist since we collected it when processing it
    const target = projects[projectName].targets[targetName];
    target.metadata.help.example.options =
        getAngularJsonProjectTargets(angularJson.projects[projectName])[targetName]
            .builder === '@angular-devkit/build-angular:prerender'
            ? { discoverRoutes: false }
            : { guessRoutes: false };
    const { inputs, outputs } = getBrowserAndServerTargetInputsAndOutputs(projectName, targetName, projects, angularJson);
    if (!outputs.length) {
        // no outputs were identified for the build or server target, so we don't
        // set any Nx cache options
        return;
    }
    target.cache = true;
    target.inputs = inputs;
    target.outputs = outputs;
}
async function getNgPackagrOutputs(target, angularWorkspaceRoot, projectRoot, context) {
    let ngPackageJsonPath = (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot, target.options?.project ?? (0, node_path_1.join)(projectRoot, 'ng-package.json'));
    const readConfig = async (configPath) => {
        if (!(0, node_fs_1.existsSync)(configPath)) {
            return undefined;
        }
        try {
            if (configPath.endsWith('.js')) {
                const result = await import(configPath);
                return result['default'] ?? result;
            }
            return (0, devkit_1.readJsonFile)(configPath);
        }
        catch { }
        return undefined;
    };
    let ngPackageJson;
    let basePath;
    if ((0, node_fs_1.statSync)(ngPackageJsonPath).isDirectory()) {
        basePath = ngPackageJsonPath;
        ngPackageJson = await readConfig((0, node_path_1.join)(ngPackageJsonPath, 'ng-package.json'));
        if (!ngPackageJson) {
            ngPackageJson = await readConfig((0, node_path_1.join)(ngPackageJsonPath, 'ng-package.js'));
        }
    }
    else {
        basePath = (0, node_path_1.dirname)(ngPackageJsonPath);
        ngPackageJson = await readConfig(ngPackageJsonPath);
    }
    if (!ngPackageJson) {
        return [];
    }
    const destination = ngPackageJson.dest
        ? (0, node_path_1.join)(basePath, ngPackageJson.dest)
        : (0, node_path_1.join)(basePath, 'dist');
    return [
        getOutput(destination, context.workspaceRoot, angularWorkspaceRoot, projectRoot),
    ];
}
function getKarmaTargetOutputs(target, angularWorkspaceRoot, projectRoot, context) {
    const defaultOutput = posix.join('{workspaceRoot}', angularWorkspaceRoot, 'coverage/{projectName}');
    let karmaConfigPath;
    if (target.builder === '@angular/build:unit-test') {
        karmaConfigPath =
            typeof target.options?.runnerConfig === 'string'
                ? target.options?.runnerConfig
                : target.options?.runnerConfig === true
                    ? 'karma.conf.js'
                    : undefined;
    }
    else {
        karmaConfigPath = target.options?.karmaConfig;
    }
    if (!karmaConfigPath) {
        return [defaultOutput];
    }
    try {
        const { parseConfig } = require('karma/lib/config');
        const karmaConfigFullPath = (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot, projectRoot, karmaConfigPath);
        const config = parseConfig(karmaConfigFullPath);
        if (config.coverageReporter.dir) {
            return [
                getOutput(config.coverageReporter.dir, context.workspaceRoot, angularWorkspaceRoot, projectRoot),
            ];
        }
    }
    catch {
        // we silently ignore any error here and fall back to the default output
    }
    return [defaultOutput];
}
function normalizeVitestOutputPath(outputPath, workspaceRoot, angularWorkspaceRoot, projectRoot) {
    const fullPath = (0, node_path_1.isAbsolute)(outputPath)
        ? outputPath
        : (0, node_path_1.join)(workspaceRoot, angularWorkspaceRoot, projectRoot, outputPath);
    return getOutput(fullPath, workspaceRoot, angularWorkspaceRoot, projectRoot);
}
async function getVitestTargetOutputs(target, angularWorkspaceRoot, projectRoot, context) {
    // https://github.com/angular/angular-cli/blob/d9cd609c5d13fe492b1f31973d9be518f8529387/packages/angular/build/src/builders/unit-test/runners/vitest/plugins.ts#L365
    const defaultOutput = posix.join('{workspaceRoot}', angularWorkspaceRoot, 'coverage/{projectName}');
    const outputs = [];
    try {
        const runnerConfig = target.options?.runnerConfig;
        let vitestConfigPath = false;
        if (typeof runnerConfig === 'string') {
            vitestConfigPath = (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot, projectRoot, runnerConfig);
        }
        else if (runnerConfig === true) {
            vitestConfigPath = await (0, vitest_1.findVitestBaseConfig)([
                (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot, projectRoot),
                (0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot),
            ]);
        }
        let vitestConfig;
        if (vitestConfigPath) {
            const { resolveConfig } = await (0, vitest_1.loadVite)();
            vitestConfig = await resolveConfig({ configFile: vitestConfigPath, mode: 'development' }, 'build');
        }
        // coverage.reportsDirectory from config
        const configReportsDir = vitestConfig?.test?.coverage?.reportsDirectory;
        if (configReportsDir) {
            outputs.push(normalizeVitestOutputPath(configReportsDir, context.workspaceRoot, angularWorkspaceRoot, projectRoot));
        }
        else {
            outputs.push(defaultOutput);
        }
        // outputFile - executor wins over config
        if (target.options?.outputFile) {
            outputs.push(normalizeVitestOutputPath(target.options.outputFile, context.workspaceRoot, angularWorkspaceRoot, projectRoot));
        }
        else {
            const configOutputFile = vitestConfig?.test
                ?.outputFile;
            if (typeof configOutputFile === 'string') {
                outputs.push(normalizeVitestOutputPath(configOutputFile, context.workspaceRoot, angularWorkspaceRoot, projectRoot));
            }
            else if (typeof configOutputFile === 'object' && configOutputFile) {
                for (const path of Object.values(configOutputFile)) {
                    if (typeof path === 'string') {
                        outputs.push(normalizeVitestOutputPath(path, context.workspaceRoot, angularWorkspaceRoot, projectRoot));
                    }
                }
            }
        }
        // reporters outputFile - executor wins over config
        if (Array.isArray(target.options?.reporters)) {
            for (const reporter of target.options.reporters) {
                if (Array.isArray(reporter) && reporter[1]?.outputFile) {
                    outputs.push(normalizeVitestOutputPath(reporter[1].outputFile, context.workspaceRoot, angularWorkspaceRoot, projectRoot));
                }
            }
        }
        else {
            const configReporters = vitestConfig?.test
                ?.reporters;
            if (Array.isArray(configReporters)) {
                for (const reporter of configReporters) {
                    if (Array.isArray(reporter) &&
                        reporter[1]?.outputFile) {
                        outputs.push(normalizeVitestOutputPath(reporter[1].outputFile, context.workspaceRoot, angularWorkspaceRoot, projectRoot));
                    }
                }
            }
        }
    }
    catch {
        // Silent fallback to defaults on any error
    }
    const uniqueOutputs = [...new Set(outputs)];
    return uniqueOutputs.length > 0 ? uniqueOutputs : [defaultOutput];
}
function getBrowserAndServerTargetInputsAndOutputs(projectName, targetName, projects, angularJson) {
    const { browserTarget, serverTarget } = extractBrowserAndServerTargets(angularJson, projectName, targetName);
    if (!browserTarget || !serverTarget) {
        // if any of these are missing, the target is invalid so we return empty values
        return { inputs: [], outputs: [] };
    }
    const browserTargetInputs = projects[browserTarget.project]?.targets?.[browserTarget.target]?.inputs ??
        [];
    const serverTargetInputs = projects[serverTarget.project]?.targets?.[serverTarget.target]?.inputs ??
        [];
    const browserTargetOutputs = projects[browserTarget.project]?.targets?.[browserTarget.target]?.outputs ??
        [];
    const serverTargetOutputs = projects[serverTarget.project]?.targets?.[serverTarget.target]?.outputs ??
        [];
    return {
        inputs: mergeInputs(...browserTargetInputs, ...serverTargetInputs),
        outputs: Array.from(new Set([...browserTargetOutputs, ...serverTargetOutputs])),
    };
}
function extractBrowserAndServerTargets(angularJson, projectName, targetName) {
    let browserTarget;
    let serverTarget;
    try {
        const targets = getAngularJsonProjectTargets(angularJson.projects[projectName]);
        const target = targets[targetName];
        let browserTargetSpecifier = target.options?.browserTarget;
        if (!browserTargetSpecifier) {
            const configuration = Object.values(target.configurations ?? {}).find((config) => !!config.browserTarget);
            browserTargetSpecifier = configuration?.browserTarget;
        }
        if (browserTargetSpecifier) {
            browserTarget = (0, targets_1.targetFromTargetString)(browserTargetSpecifier, projectName, targetName);
        }
        let serverTargetSpecifier = target.options?.serverTarget;
        if (!serverTargetSpecifier) {
            serverTargetSpecifier = Object.values(target.configurations ?? {}).find((config) => !!config.serverTarget)?.serverTarget;
        }
        if (serverTargetSpecifier) {
            serverTarget = (0, targets_1.targetFromTargetString)(serverTargetSpecifier, projectName, targetName);
        }
    }
    catch { }
    return { browserTarget: browserTarget, serverTarget };
}
function mergeInputs(...inputs) {
    const stringInputs = new Set();
    const externalDependencies = new Set();
    for (const input of inputs) {
        if (typeof input === 'string') {
            stringInputs.add(input);
        }
        else if ('externalDependencies' in input) {
            // we only infer external dependencies, so we don't need to handle the other input definitions
            for (const externalDependency of input.externalDependencies) {
                externalDependencies.add(externalDependency);
            }
        }
    }
    return [
        ...stringInputs,
        ...(externalDependencies.size
            ? [{ externalDependencies: Array.from(externalDependencies) }]
            : []),
    ];
}
function getOutput(path, workspaceRoot, angularWorkspaceRoot, projectRoot) {
    const relativePath = (0, devkit_1.normalizePath)((0, node_path_1.relative)((0, node_path_1.join)(workspaceRoot, angularWorkspaceRoot, projectRoot), path));
    if (relativePath.startsWith('..')) {
        return posix.join('{workspaceRoot}', angularWorkspaceRoot, projectRoot, relativePath);
    }
    else {
        return posix.join('{projectRoot}', relativePath);
    }
}
function getAngularJsonProjectTargets(project) {
    return project.architect ?? project.targets;
}
async function filterAngularConfigs(configFiles, context) {
    const preErrors = [];
    const candidates = await Promise.all(configFiles.map(async (configFile) => {
        try {
            const angularWorkspaceRoot = (0, node_path_1.dirname)(configFile);
            const siblingFiles = (0, node_fs_1.readdirSync)((0, node_path_1.join)(context.workspaceRoot, angularWorkspaceRoot));
            if (!siblingFiles.includes('package.json')) {
                return null;
            }
            return { configFile, angularWorkspaceRoot };
        }
        catch (e) {
            preErrors.push([configFile, e]);
            return null;
        }
    }));
    return {
        entries: candidates.filter((c) => c !== null),
        preErrors,
    };
}
