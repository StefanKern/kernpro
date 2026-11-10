"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNgPackagrVersionInfo = getNgPackagrVersionInfo;
const angular_version_utils_1 = require("../angular-version-utils");
let ngPackagrVersionInfo;
function getNgPackagrVersionInfo() {
    if (!ngPackagrVersionInfo) {
        ngPackagrVersionInfo = (0, angular_version_utils_1.getInstalledPackageVersionInfo)('ng-packagr');
    }
    return ngPackagrVersionInfo;
}
