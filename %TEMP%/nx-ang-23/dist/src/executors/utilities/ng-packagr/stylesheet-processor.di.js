"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStylesheetProcessorFactoryProvider = getStylesheetProcessorFactoryProvider;
const stylesheet_processor_di_1 = require("ng-packagr/src/lib/styles/stylesheet-processor.di");
function getStylesheetProcessorFactoryProvider() {
    return {
        provide: stylesheet_processor_di_1.STYLESHEET_PROCESSOR_TOKEN,
        useFactory: () => {
            const { getStylesheetProcessor } = require('./stylesheet-processor');
            return getStylesheetProcessor();
        },
        deps: [],
    };
}
