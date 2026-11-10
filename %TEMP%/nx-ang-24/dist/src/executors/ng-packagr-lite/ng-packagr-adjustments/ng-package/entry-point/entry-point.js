"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNgEntryPoint = createNgEntryPoint;
const entry_point_1 = require("ng-packagr/src/lib/ng-package/entry-point/entry-point");
const path_1 = require("ng-packagr/src/lib/utils/path");
const node_path_1 = require("node:path");
function createNgEntryPoint(packageJson, ngPackageJson, basePath, secondaryData) {
    class NgEntryPoint extends entry_point_1.NgEntryPoint {
        constructor(packageJson, ngPackageJson, basePath, _secondaryData) {
            super(packageJson, ngPackageJson, basePath, _secondaryData);
            this.packageJson = packageJson;
            this.ngPackageJson = ngPackageJson;
            this.basePath = basePath;
            this._secondaryData = _secondaryData;
        }
        get primaryDestinationPath() {
            return (this._secondaryData?.primaryDestinationPath ?? this.destinationPath);
        }
        get destinationFiles() {
            let primaryDestPath = this.destinationPath;
            let secondaryDir = '';
            if (this._secondaryData) {
                primaryDestPath = this._secondaryData.primaryDestinationPath;
                secondaryDir = (0, node_path_1.relative)(primaryDestPath, this._secondaryData.destinationPath);
            }
            const flatModuleFile = this.flatModuleFile;
            const pathJoinWithDest = (...paths) => (0, node_path_1.join)(primaryDestPath, ...paths);
            return {
                directory: (0, path_1.ensureUnixPath)(secondaryDir),
                declarations: pathJoinWithDest('tmp-typings', secondaryDir, `${flatModuleFile}.d.ts`),
                // changed to use esm2022
                declarationsBundled: pathJoinWithDest(secondaryDir, `${flatModuleFile}.d.ts`),
                declarationsDir: pathJoinWithDest(secondaryDir),
                esm2022: pathJoinWithDest('tmp-esm2022', secondaryDir, `${flatModuleFile}.js`),
                // changed to use esm2022
                fesm2022: pathJoinWithDest('esm2022', secondaryDir, `${flatModuleFile}.js`),
                // changed to use esm2022
                fesm2022Dir: pathJoinWithDest('esm2022'),
            };
        }
    }
    return new NgEntryPoint(packageJson, ngPackageJson, basePath, secondaryData);
}
