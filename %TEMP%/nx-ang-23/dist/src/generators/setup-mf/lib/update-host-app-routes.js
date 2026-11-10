"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateHostAppRoutes = updateHostAppRoutes;
const devkit_1 = require("@nx/devkit");
const route_utils_1 = require("../../../utils/nx-devkit/route-utils");
const zoneless_1 = require("../../../utils/zoneless");
function updateHostAppRoutes(tree, options) {
    const project = (0, devkit_1.readProjectConfiguration)(tree, options.appName);
    const { appComponentInfo, nxWelcomeComponentInfo } = options;
    const zoneless = (0, zoneless_1.isZonelessApp)(project);
    tree.write((0, devkit_1.joinPathFragments)(project.sourceRoot, 'app', `${appComponentInfo.extensionlessFileName}.html`), `<ul class="remote-menu">
<li><a routerLink="/">Home</a></li>
</ul>
<router-outlet></router-outlet>
`);
    let pathToHostRootRoutingFile = (0, devkit_1.joinPathFragments)(project.sourceRoot, 'app/app.routes.ts');
    if (!tree.exists(pathToHostRootRoutingFile)) {
        pathToHostRootRoutingFile = (0, devkit_1.joinPathFragments)(project.sourceRoot, 'app/app-routing.module.ts');
    }
    if (!tree.exists(pathToHostRootRoutingFile)) {
        pathToHostRootRoutingFile = (0, devkit_1.joinPathFragments)(project.sourceRoot, 'app/app-routing-module.ts');
    }
    (0, route_utils_1.addRoute)(tree, pathToHostRootRoutingFile, `{
      path: '',
      component: ${nxWelcomeComponentInfo.symbolName}
    }`);
    tree.write(pathToHostRootRoutingFile, `import { ${nxWelcomeComponentInfo.symbolName} } from './${nxWelcomeComponentInfo.extensionlessFileName}';
${tree.read(pathToHostRootRoutingFile, 'utf-8')}`);
    (0, devkit_1.generateFiles)(tree, (0, devkit_1.joinPathFragments)(__dirname, '../files/host-files'), (0, devkit_1.joinPathFragments)(project.sourceRoot, 'app'), {
        appName: options.appName,
        standalone: options.standalone,
        appFileName: appComponentInfo.extensionlessFileName,
        appSymbolName: appComponentInfo.symbolName,
        nxWelcomeFileName: nxWelcomeComponentInfo.extensionlessFileName,
        nxWelcomeSymbolName: nxWelcomeComponentInfo.symbolName,
        zoneless,
        tmpl: '',
    });
}
