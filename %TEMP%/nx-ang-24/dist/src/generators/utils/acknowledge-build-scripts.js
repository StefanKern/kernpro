"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.acknowledgeAngularBuildScripts = acknowledgeAngularBuildScripts;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
// The Angular build tooling (`@angular/build`, `@angular-devkit/build-angular`,
// `ng-packagr`) pulls in esbuild, lmdb (-> msgpackr-extract) and sass
// (-> @parcel/watcher). All of them ship prebuilt binaries as optional
// dependencies, so their install scripts have nothing to do.
const angularBuildAllowBuilds = {
    esbuild: false,
    lmdb: false,
    'msgpackr-extract': false,
    '@parcel/watcher': false,
};
function acknowledgeAngularBuildScripts(tree) {
    (0, internal_1.acknowledgeBuildScripts)(tree, (0, devkit_1.detectPackageManager)(tree.root), angularBuildAllowBuilds);
}
