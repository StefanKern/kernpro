"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWriteBundlesTransformProvider = getWriteBundlesTransformProvider;
const transform_di_1 = require("ng-packagr/src/lib/graph/transform.di");
const write_bundles_di_1 = require("ng-packagr/src/lib/ng-package/entry-point/write-bundles.di");
const options_di_1 = require("ng-packagr/src/lib/ng-package/options.di");
const write_bundles_transform_1 = require("./write-bundles.transform");
function getWriteBundlesTransformProvider() {
    return (0, transform_di_1.provideTransform)({
        provide: write_bundles_di_1.WRITE_BUNDLES_TRANSFORM_TOKEN,
        useFactory: write_bundles_transform_1.writeBundlesTransform,
        deps: [options_di_1.OPTIONS_TOKEN],
    });
}
