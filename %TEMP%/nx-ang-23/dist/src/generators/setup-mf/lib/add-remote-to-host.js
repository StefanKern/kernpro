"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkIsCommaNeeded = checkIsCommaNeeded;
exports.addRemoteToHost = addRemoteToHost;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const internal_1 = require("@nx/js/internal");
const route_utils_1 = require("../../../utils/nx-devkit/route-utils");
let tsModule;
function checkIsCommaNeeded(mfRemoteText) {
    const remoteText = mfRemoteText.replace(/\s+/g, '');
    return !remoteText.endsWith(',]')
        ? remoteText === '[]'
            ? false
            : true
        : false;
}
function addRemoteToHost(tree, options) {
    if (options.host) {
        const hostProject = (0, devkit_1.readProjectConfiguration)(tree, options.host);
        const pathToMFManifest = getDynamicManifestFile(tree, hostProject);
        const hostFederationType = !!pathToMFManifest ? 'dynamic' : 'static';
        const isHostUsingTypescriptConfig = tree.exists((0, devkit_1.joinPathFragments)(hostProject.root, 'module-federation.config.ts'));
        if (hostFederationType === 'static') {
            addRemoteToStaticHost(tree, options, hostProject, isHostUsingTypescriptConfig);
        }
        else if (hostFederationType === 'dynamic') {
            addRemoteToDynamicHost(tree, options, pathToMFManifest, (0, internal_1.getProjectSourceRoot)(hostProject, tree));
        }
        addLazyLoadedRouteToHostAppModule(tree, options, hostFederationType);
    }
}
function getDynamicManifestFile(tree, project) {
    // {sourceRoot}/assets/module-federation.manifest.json was the generated
    // path for the manifest file in the past. We now generate the manifest
    // file at {root}/public/module-federation.manifest.json. This check
    // ensures that we can still support the old path for backwards
    // compatibility since old projects may still have the manifest file
    // at the old path.
    return [
        (0, devkit_1.joinPathFragments)(project.root, 'public/module-federation.manifest.json'),
        (0, devkit_1.joinPathFragments)((0, internal_1.getProjectSourceRoot)(project, tree), 'assets/module-federation.manifest.json'),
    ].find((path) => tree.exists(path));
}
function addRemoteToStaticHost(tree, options, hostProject, isHostUsingTypescript) {
    const hostMFConfigPath = (0, devkit_1.joinPathFragments)(hostProject.root, isHostUsingTypescript
        ? 'module-federation.config.ts'
        : 'module-federation.config.js');
    if (!hostMFConfigPath || !tree.exists(hostMFConfigPath)) {
        throw new Error(`The selected host application, ${options.host}, does not contain a module-federation.config.{ts,js} or module-federation.manifest.json file. Are you sure it has been set up as a host application?`);
    }
    const hostMFConfig = tree.read(hostMFConfigPath, 'utf-8');
    const { ast, query } = require('@phenomnomnominal/tsquery');
    const webpackAst = ast(hostMFConfig);
    const mfRemotesNode = query(webpackAst, 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name=remotes]) > ArrayLiteralExpression')[0];
    const endOfPropertiesPos = mfRemotesNode.getEnd() - 1;
    const isCommaNeeded = checkIsCommaNeeded(mfRemotesNode.getText());
    const updatedConfig = `${hostMFConfig.slice(0, endOfPropertiesPos)}${isCommaNeeded ? ',' : ''}'${options.appName}',${hostMFConfig.slice(endOfPropertiesPos)}`;
    tree.write(hostMFConfigPath, updatedConfig);
}
function addRemoteToDynamicHost(tree, options, pathToMfManifest, hostSourceRoot) {
    // TODO(Colum): Remove for Nx 22
    const usingLegacyDynamicFederation = tree
        .read(`${hostSourceRoot}/main.ts`, 'utf-8')
        .includes('setRemoteDefinitions(');
    (0, devkit_1.updateJson)(tree, pathToMfManifest, (manifest) => {
        return {
            ...manifest,
            [options.appName]: `http://localhost:${options.port}${usingLegacyDynamicFederation ? '' : '/mf-manifest.json'}`,
        };
    });
}
function addLazyLoadedRouteToHostAppModule(tree, options, hostFederationType) {
    if (!tsModule) {
        tsModule = (0, internal_1.ensureTypescript)();
    }
    const hostAppConfig = (0, devkit_1.readProjectConfiguration)(tree, options.host);
    const sourceRoot = (0, internal_1.getProjectSourceRoot)(hostAppConfig, tree);
    const pathToHostRootRouting = `${sourceRoot}/app/app.routes.ts`;
    if (!tree.exists(pathToHostRootRouting)) {
        return;
    }
    const hostRootRoutingFile = tree.read(pathToHostRootRouting, 'utf-8');
    let sourceFile = tsModule.createSourceFile(pathToHostRootRouting, hostRootRoutingFile, tsModule.ScriptTarget.Latest, true);
    // TODO(Colum): Remove for Nx 22
    const usingLegacyDynamicFederation = hostFederationType === 'dynamic' &&
        tree
            .read(`${sourceRoot}/main.ts`, 'utf-8')
            .includes('setRemoteDefinitions(');
    if (hostFederationType === 'dynamic') {
        sourceFile = (0, js_1.insertImport)(tree, sourceFile, pathToHostRootRouting, usingLegacyDynamicFederation ? 'loadRemoteModule' : 'loadRemote', usingLegacyDynamicFederation
            ? '@nx/angular/mf'
            : '@module-federation/enhanced/runtime');
    }
    const routePathName = options.standalone ? 'Routes' : 'Module';
    const exportedRemote = options.standalone
        ? 'remoteRoutes'
        : 'RemoteEntryModule';
    const remoteModulePath = `${options.appName.replace(/-/g, '_')}/${routePathName}`;
    const routeToAdd = hostFederationType === 'dynamic'
        ? usingLegacyDynamicFederation
            ? `loadRemoteModule('${options.appName.replace(/-/g, '_')}', './${routePathName}')`
            : `loadRemote<typeof import('${remoteModulePath}')>('${remoteModulePath}')`
        : `import('${remoteModulePath}')`;
    (0, route_utils_1.addRoute)(tree, pathToHostRootRouting, `{
    path: '${options.appName}',
    loadChildren: () => ${routeToAdd}.then(m => m!.${exportedRemote})
    }`);
    let pathToAppComponentTemplate = (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app.component.html');
    const candidatePaths = [
        pathToAppComponentTemplate,
        (0, devkit_1.joinPathFragments)(sourceRoot, 'app/app.html'),
    ];
    for (const path of candidatePaths) {
        if (tree.exists(path)) {
            pathToAppComponentTemplate = path;
            break;
        }
    }
    const appComponent = tree.read(pathToAppComponentTemplate, 'utf-8');
    if (appComponent.includes(`<ul class="remote-menu">`) &&
        appComponent.includes('</ul>')) {
        const indexOfClosingMenuTag = appComponent.indexOf('</ul>');
        const newAppComponent = `${appComponent.slice(0, indexOfClosingMenuTag)}<li><a routerLink="${options.appName}">${(0, devkit_1.names)(options.appName).className}</a></li>\n${appComponent.slice(indexOfClosingMenuTag)}`;
        tree.write(pathToAppComponentTemplate, newAppComponent);
    }
}
