// Helper function to extract file extension from a path
function extname(path) {
    const lastDot = path.lastIndexOf('.');
    const lastSlash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'));
    if (lastDot === -1 || lastDot < lastSlash) {
        return '';
    }
    return path.slice(lastDot);
}
/**
 * Checks if a URL string is absolute (has protocol)
 */
function isAbsoluteUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Safely processes remote locations, handling both relative and absolute URLs
 * while preserving query parameters and hash fragments for absolute URLs
 */
function processRemoteLocation(remoteLocation, remoteEntryExt) {
    // Handle promise-based remotes as-is
    if (remoteLocation.startsWith('promise new Promise')) {
        return remoteLocation;
    }
    if (isAbsoluteUrl(remoteLocation)) {
        // Use new URL parsing for absolute URLs (supports query params/hash)
        const url = new URL(remoteLocation);
        const ext = extname(url.pathname);
        const needsRemoteEntry = !['.js', '.mjs', '.json'].includes(ext);
        if (needsRemoteEntry) {
            url.pathname = url.pathname.endsWith('/')
                ? `${url.pathname}remoteEntry.${remoteEntryExt}`
                : `${url.pathname}/remoteEntry.${remoteEntryExt}`;
        }
        return url.href;
    }
    else {
        // Use string manipulation for relative URLs (backward compatibility)
        const ext = extname(remoteLocation);
        const needsRemoteEntry = !['.js', '.mjs', '.json'].includes(ext);
        if (needsRemoteEntry) {
            const baseRemote = remoteLocation.endsWith('/')
                ? remoteLocation.slice(0, -1)
                : remoteLocation;
            return `${baseRemote}/remoteEntry.${remoteEntryExt}`;
        }
        return remoteLocation;
    }
}
/**
 * Processes remote URLs for runtime environments, resolving relative URLs against window.location.origin
 */
function processRuntimeRemoteUrl(remoteUrl, remoteEntryExt) {
    if (isAbsoluteUrl(remoteUrl)) {
        return processRemoteLocation(remoteUrl, remoteEntryExt);
    }
    else {
        // For runtime relative URLs, resolve against current origin
        const baseUrl = typeof globalThis !== 'undefined' &&
            typeof globalThis.window !== 'undefined' &&
            globalThis.window.location
            ? globalThis.window.location.origin
            : 'http://localhost';
        const absoluteUrl = new URL(remoteUrl, baseUrl).href;
        return processRemoteLocation(absoluteUrl, remoteEntryExt);
    }
}

let resolveRemoteUrl;
/**
 * @deprecated Use Runtime Helpers from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 */
function setRemoteUrlResolver(_resolveRemoteUrl) {
    resolveRemoteUrl = _resolveRemoteUrl;
}
let remoteUrlDefinitions;
/**
 * @deprecated Use init() from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 * If you have a remote app called `my-remote-app` and you want to use the `http://localhost:4201/mf-manifest.json` as the remote url, you should change it from:
 * ```ts
 * import { setRemoteDefinitions } from '@nx/angular/mf';
 *
 * setRemoteDefinitions({
 *   'my-remote-app': 'http://localhost:4201/mf-manifest.json'
 * });
 * ```
 * to use init():
 * ```ts
 * import { init } from '@module-federation/enhanced/runtime';
 *
 * init({
 *   name: 'host',
 *   remotes: [{
 *     name: 'my-remote-app',
 *     entry: 'http://localhost:4201/mf-manifest.json'
 *   }]
 * });
 * ```
 */
function setRemoteDefinitions(definitions) {
    remoteUrlDefinitions = definitions;
}
/**
 * @deprecated Use registerRemotes() from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 * If you set a remote app with `setRemoteDefinition` such as:
 * ```ts
 * import { setRemoteDefinition } from '@nx/angular/mf';
 *
 * setRemoteDefinition(
 *   'my-remote-app',
 *   'http://localhost:4201/mf-manifest.json'
 * );
 * ```
 * change it to use registerRemotes():
 * ```ts
 * import { registerRemotes } from '@module-federation/enhanced/runtime';
 *
 * registerRemotes([
 *  {
 *     name: 'my-remote-app',
 *     entry: 'http://localhost:4201/mf-manifest.json'
 *   }
 * ]);
 * ```
 */
function setRemoteDefinition(remoteName, remoteUrl) {
    remoteUrlDefinitions ??= {};
    remoteUrlDefinitions[remoteName] = remoteUrl;
}
let remoteModuleMap = new Map();
let remoteContainerMap = new Map();
/**
 * @deprecated Use loadRemote() from '@module-federation/enhanced/runtime' instead. This will be removed in Nx 22.
 * If you set a load a remote with `loadRemoteModule` such as:
 * ```ts
 * import { loadRemoteModule } from '@nx/angular/mf';
 *
 * loadRemoteModule('my-remote-app', './Module').then(m => m.RemoteEntryModule);
 * ```
 * change it to use loadRemote():
 * ```ts
 * import { loadRemote } from '@module-federation/enhanced/runtime';
 *
 * loadRemote<typeof import('my-remote-app/Module')>('my-remote-app/Module').then(m => m.RemoteEntryModule);
 * ```
 */
async function loadRemoteModule(remoteName, moduleName) {
    const remoteModuleKey = `${remoteName}:${moduleName}`;
    if (remoteModuleMap.has(remoteModuleKey)) {
        return remoteModuleMap.get(remoteModuleKey);
    }
    const container = remoteContainerMap.has(remoteName)
        ? remoteContainerMap.get(remoteName)
        : await loadRemoteContainer(remoteName);
    const factory = await container.get(moduleName);
    const Module = factory();
    remoteModuleMap.set(remoteModuleKey, Module);
    return Module;
}
function loadModule(url) {
    return import(/* webpackIgnore:true */ url);
}
let initialSharingScopeCreated = false;
async function loadRemoteContainer(remoteName) {
    if (!resolveRemoteUrl && !remoteUrlDefinitions) {
        throw new Error('Call setRemoteDefinitions or setRemoteUrlResolver to allow Dynamic Federation to find the remote apps correctly.');
    }
    if (!initialSharingScopeCreated) {
        initialSharingScopeCreated = true;
        await __webpack_init_sharing__('default');
    }
    const remoteUrl = remoteUrlDefinitions
        ? remoteUrlDefinitions[remoteName]
        : await resolveRemoteUrl(remoteName);
    const containerUrl = processRuntimeRemoteUrl(remoteUrl, 'mjs');
    const container = await loadModule(containerUrl);
    await container.init(__webpack_share_scopes__.default);
    remoteContainerMap.set(remoteName, container);
    return container;
}

/**
 * Generated bundle index. Do not edit.
 */

export { loadRemoteModule, setRemoteDefinition, setRemoteDefinitions, setRemoteUrlResolver };
//# sourceMappingURL=nx-angular-mf.mjs.map
