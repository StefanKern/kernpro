"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = upgradeToAngular222;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const internal_2 = require("@nx/js/internal");
const path_1 = require("path");
// Keep these versions pinned; versions.ts advances to later Angular versions.
const ANGULAR_22_2_VERSIONS = {
    '@angular/core': '~22.2.0',
    '@angular/animations': '~22.2.0',
    '@angular/common': '~22.2.0',
    '@angular/compiler': '~22.2.0',
    '@angular/compiler-cli': '~22.2.0',
    '@angular/elements': '~22.2.0',
    '@angular/forms': '~22.2.0',
    '@angular/language-service': '~22.2.0',
    '@angular/localize': '~22.2.0',
    '@angular/platform-browser': '~22.2.0',
    '@angular/platform-browser-dynamic': '~22.2.0',
    '@angular/platform-server': '~22.2.0',
    '@angular/router': '~22.2.0',
    '@angular/service-worker': '~22.2.0',
    '@angular/upgrade': '~22.2.0',
    '@angular/cli': '~22.2.0',
    '@angular/build': '~22.2.0',
    '@angular/pwa': '~22.2.0',
    '@angular/ssr': '~22.2.0',
    '@angular-devkit/build-angular': '~22.2.0',
    '@angular-devkit/core': '~22.2.0',
    '@angular-devkit/schematics': '~22.2.0',
    '@angular-devkit/architect': '~0.2202.0',
    '@angular-devkit/build-webpack': '~0.2202.0',
    '@schematics/angular': '~22.2.0',
    '@angular/aria': '~22.2.0',
    '@angular/cdk': '~22.2.0',
    '@angular/cdk-experimental': '~22.2.0',
    '@angular/google-maps': '~22.2.0',
    '@angular/material': '~22.2.0',
    '@angular/material-date-fns-adapter': '~22.2.0',
    '@angular/material-experimental': '~22.2.0',
    '@angular/material-luxon-adapter': '~22.2.0',
    '@angular/material-moment-adapter': '~22.2.0',
    'ng-packagr': '~22.2.0',
    'zone.js': '~0.16.2',
};
const COMPONENT_TESTING_SPECIFIER = /^(@?cypress\/angular|@nx\/angular\/plugins\/component-testing$)/;
const MODULE_FEDERATION_SPECIFIER = /^(@module-federation\/(enhanced|node)|@nx\/module-federation|@nx\/angular\/(mf|module-federation))(\/|$)/;
const MARKER_TEXT = /cypress\/angular|module-federation|@nx\/angular\/(mf|plugins\/component-testing)/;
const NX_WEBPACK_EXECUTORS = new Set([
    '@nx/angular:webpack-browser',
    '@nx/angular:webpack-server',
    '@nx/angular:module-federation-dev-server',
    '@nx/angular:module-federation-dev-ssr',
]);
const WEBPACK_CONFIG_FILE = /^(webpack[\w.-]*|module-federation\.config)\.[cm]?[jt]s$/;
const RESOLVE_EXTENSIONS = ['.ts', '.js', '.mjs', '.cjs', '.mts', '.cts'];
const DEPENDENCY_FIELDS = [
    'dependencies',
    'devDependencies',
    'optionalDependencies',
    'peerDependencies',
];
let ts;
async function upgradeToAngular222(tree) {
    const scan = scanWorkspace(tree);
    const unresolved = [];
    const moduleFederationConfigs = findModuleFederationConfigs(tree, scan, unresolved);
    const reasons = [];
    if (scan.componentTestingFiles.length > 0) {
        reasons.push(`Cypress component testing (${scan.componentTestingFiles.join(', ')}) fails with the webpack-dev-server 6 that Angular 22.2 installs (https://github.com/cypress-io/cypress/issues/34259)`);
    }
    if (moduleFederationConfigs.length > 0) {
        reasons.push(`Module Federation builds (${moduleFederationConfigs.join(', ')}) fail with the webpack 5.111 that Angular 22.2 installs (https://github.com/module-federation/core/issues/5077)`);
    }
    else if (unresolved.length > 0 && scan.moduleFederationFiles.length > 0) {
        reasons.push(`Module Federation fails with the webpack 5.111 that Angular 22.2 installs (https://github.com/module-federation/core/issues/5077). ${scan.moduleFederationFiles.join(', ')} import it, and the migration could not tell whether an Angular webpack build does: ${unresolved.join('; ')}`);
    }
    if (reasons.length > 0) {
        const nextSteps = [
            `Kept Angular 22.1. ${reasons.join('. ')}. A later Nx migration updates Angular once these issues are fixed. To update before then, move the Angular packages to 22.2 by hand and work around the issues.`,
        ];
        return { nextSteps, agentContext: nextSteps };
    }
    const declared = (0, devkit_1.readJson)(tree, 'package.json');
    const { '@angular/core': core, ...others } = ANGULAR_22_2_VERSIONS;
    // `@angular/core` goes to `dependencies` when the root does not declare it.
    (0, devkit_1.addDependenciesToPackageJson)(tree, { '@angular/core': core }, Object.fromEntries(Object.entries(others).filter(([name]) => declared.dependencies?.[name] || declared.devDependencies?.[name])));
}
function scanWorkspace(tree) {
    const scan = {
        angularJsonPaths: [],
        workspacePackages: new Set(),
        declaredDependencies: new Map(),
        componentTestingFiles: [],
        moduleFederationFiles: [],
    };
    // Shared support libraries and config helpers can hold the imports, so the
    // whole workspace is scanned.
    (0, devkit_1.visitNotIgnoredFiles)(tree, '.', (filePath) => {
        const fileName = (0, path_1.basename)(filePath);
        if (fileName === 'angular.json') {
            scan.angularJsonPaths.push(filePath);
            return;
        }
        if (fileName === 'package.json') {
            // Installs fail on a workspace package.json that doesn't parse, so
            // skipping one loses no installed or linked package.
            try {
                const packageJson = (0, devkit_1.readJson)(tree, filePath);
                if (typeof packageJson.name === 'string') {
                    scan.workspacePackages.add(packageJson.name);
                }
                scan.declaredDependencies.set((0, path_1.dirname)(filePath), new Set(DEPENDENCY_FIELDS.flatMap((field) => Object.keys(packageJson[field] ?? {}))));
            }
            catch { }
            return;
        }
        if (!/\.[cm]?[jt]sx?$/.test(filePath)) {
            return;
        }
        const content = tree.read(filePath, 'utf-8');
        if (!MARKER_TEXT.test(content)) {
            return;
        }
        const { specifiers } = readModuleSpecifiers(filePath, content);
        if (specifiers.some((s) => COMPONENT_TESTING_SPECIFIER.test(s))) {
            scan.componentTestingFiles.push(filePath);
        }
        if (specifiers.some((s) => MODULE_FEDERATION_SPECIFIER.test(s))) {
            scan.moduleFederationFiles.push(filePath);
        }
    });
    return scan;
}
// The webpack config files of Angular webpack targets that import Module
// Federation, following relative imports. An import or config the migration
// cannot read is recorded in `unresolved`.
function findModuleFederationConfigs(tree, scan, unresolved) {
    const configs = new Set();
    const visited = new Set();
    const visit = (fromDir, specifier, importer) => {
        if (MODULE_FEDERATION_SPECIFIER.test(specifier)) {
            configs.add(importer);
            return;
        }
        if (specifier.startsWith('.')) {
            const filePath = resolveFile(tree, (0, devkit_1.joinPathFragments)(fromDir, specifier));
            if (!filePath) {
                unresolved.push(`${importer} loads "${specifier}", which is missing`);
                return;
            }
            if (visited.has(filePath)) {
                return;
            }
            visited.add(filePath);
            const { specifiers, computed } = readModuleSpecifiers(filePath, tree.read(filePath, 'utf-8'));
            if (computed) {
                unresolved.push(`${filePath} has a computed require or import`);
            }
            for (const s of specifiers) {
                visit((0, path_1.dirname)(filePath), s, filePath);
            }
            return;
        }
        if (!(0, internal_1.isBuiltinModuleImport)(specifier) &&
            !isInstalledPackage(tree, fromDir, specifier, scan)) {
            unresolved.push(`${importer} loads "${specifier}", which is not an installed package`);
        }
    };
    const projectRoots = new Set();
    const visitTarget = (executor, target, workspaceRoot, projectRoot, label) => {
        if (!isAngularWebpackExecutor(executor)) {
            return;
        }
        projectRoots.add(projectRoot);
        for (const options of [
            target.options,
            ...Object.values(target.configurations ?? {}),
        ]) {
            for (const specifier of getWebpackConfigSpecifiers(executor, options ?? {}, projectRoot)) {
                visit(workspaceRoot, specifier, label);
            }
        }
    };
    const targetDefaults = (0, devkit_1.readNxJson)(tree)?.targetDefaults;
    for (const [projectName, project] of (0, devkit_1.getProjects)(tree)) {
        for (const [targetName, target] of Object.entries(project.targets ?? {})) {
            const defaults = (0, internal_1.readTargetDefaultsForTarget)(targetName, targetDefaults, target.executor, {
                projectName,
                projectNode: {
                    name: projectName,
                    type: project.projectType === 'application' ? 'app' : 'lib',
                    data: project,
                },
            });
            const merged = defaults
                ? (0, internal_1.mergeTargetConfigurations)(target, defaults)
                : target;
            visitTarget(merged.executor, merged, '.', project.root, `${projectName}:${targetName}`);
        }
    }
    for (const angularJsonPath of scan.angularJsonPaths) {
        let angularJson;
        try {
            angularJson = (0, devkit_1.readJson)(tree, angularJsonPath);
        }
        catch {
            unresolved.push(`${angularJsonPath} could not be parsed`);
            continue;
        }
        const workspaceRoot = (0, path_1.dirname)(angularJsonPath);
        for (const [projectName, project] of Object.entries(angularJson.projects ?? {})) {
            const projectRoot = (0, devkit_1.joinPathFragments)(workspaceRoot, project.root ?? '');
            for (const [targetName, target] of Object.entries(project.architect ?? project.targets ?? {})) {
                visitTarget(target.builder, target, workspaceRoot, projectRoot, `${angularJsonPath} ${projectName}:${targetName}`);
            }
        }
    }
    // Configs a target does not reference directly, such as a remote's
    // module-federation.config, are found by name.
    for (const projectRoot of projectRoots) {
        for (const child of tree.children(projectRoot)) {
            if (WEBPACK_CONFIG_FILE.test(child)) {
                visit(projectRoot, `./${child}`, projectRoot);
            }
        }
    }
    return [...configs];
}
function isAngularWebpackExecutor(executor) {
    return (!!executor &&
        (NX_WEBPACK_EXECUTORS.has(executor) ||
            executor.startsWith('@angular-builders/custom-webpack:') ||
            executor.startsWith('ngx-build-plus:')));
}
// The webpack config modules a target loads, as specifiers relative to the
// workspace root.
function getWebpackConfigSpecifiers(executor, options, projectRoot) {
    const toSpecifier = (path) => `./${path
        .replace(/^\{workspaceRoot\}\/?/, '')
        .replace(/\{projectRoot\}/g, projectRoot)}`;
    const { customWebpackConfig, extraWebpackConfig, plugin } = options;
    const specifiers = [];
    if (typeof customWebpackConfig?.path === 'string') {
        specifiers.push(toSpecifier(customWebpackConfig.path));
    }
    else if (customWebpackConfig &&
        executor.startsWith('@angular-builders/custom-webpack:')) {
        specifiers.push('./webpack.config.js');
    }
    if (typeof extraWebpackConfig === 'string') {
        specifiers.push(toSpecifier(extraWebpackConfig));
    }
    // ngx-build-plus loads a `~` plugin path from the workspace root and
    // anything else as a module.
    if (typeof plugin === 'string' && plugin) {
        specifiers.push(plugin.startsWith('~') ? toSpecifier(plugin.slice(1)) : plugin);
    }
    return specifiers;
}
function resolveFile(tree, path) {
    return [
        path,
        ...RESOLVE_EXTENSIONS.map((extension) => `${path}${extension}`),
        ...RESOLVE_EXTENSIONS.map((extension) => (0, devkit_1.joinPathFragments)(path, `index${extension}`)),
    ].find((candidate) => tree.isFile(candidate));
}
// A package installed in a node_modules folder the importer resolves from, or
// declared by the importer's nearest package.json for Yarn PnP installs, which
// have no node_modules. A workspace package or path alias points back into the
// workspace, so it is not one.
function isInstalledPackage(tree, fromDir, specifier, scan) {
    const segments = specifier.split('/');
    const packageName = segments
        .slice(0, specifier.startsWith('@') ? 2 : 1)
        .join('/');
    if (scan.workspacePackages.has(packageName)) {
        return false;
    }
    let nearestPackageJsonChecked = false;
    for (let dir = fromDir;; dir = (0, path_1.dirname)(dir)) {
        if (tree.exists((0, devkit_1.joinPathFragments)(dir, 'node_modules', packageName, 'package.json'))) {
            return true;
        }
        const declared = scan.declaredDependencies.get(dir);
        if (declared && !nearestPackageJsonChecked) {
            nearestPackageJsonChecked = true;
            if (declared.has(packageName)) {
                return true;
            }
        }
        if (dir === '.') {
            return false;
        }
    }
}
// Specifiers of `import`/`export ... from`, `import x = require()`,
// `import()` and `require()`. `computed` is set when an `import()` or
// `require()` takes a value other than a string literal.
function readModuleSpecifiers(filePath, content) {
    ts ??= (0, internal_2.ensureTypescript)();
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
    const specifiers = [];
    let computed = false;
    const visit = (node) => {
        if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
            node.moduleSpecifier &&
            ts.isStringLiteral(node.moduleSpecifier)) {
            specifiers.push(node.moduleSpecifier.text);
        }
        else if (ts.isExternalModuleReference(node) &&
            ts.isStringLiteral(node.expression)) {
            specifiers.push(node.expression.text);
        }
        else if (ts.isCallExpression(node) &&
            (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
                (ts.isIdentifier(node.expression) &&
                    node.expression.text === 'require'))) {
            const [argument] = node.arguments;
            if (argument && ts.isStringLiteralLike(argument)) {
                specifiers.push(argument.text);
            }
            else {
                computed = true;
            }
        }
        ts.forEachChild(node, visit);
    };
    visit(sourceFile);
    return { specifiers, computed };
}
