"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNgPackagrInstance = getNgPackagrInstance;
async function getNgPackagrInstance() {
    const { getStylesheetProcessorFactoryProvider } = await import('../../utilities/ng-packagr/stylesheet-processor.di.js');
    const { ngPackagr } = await import('ng-packagr');
    const packagr = ngPackagr();
    packagr.withProviders([getStylesheetProcessorFactoryProvider()]);
    return packagr;
}
