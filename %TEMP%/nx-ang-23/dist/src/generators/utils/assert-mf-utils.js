"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertRspackIsCSR = assertRspackIsCSR;
function assertRspackIsCSR(bundler, ssr) {
    if (bundler === 'rspack' && ssr) {
        throw new Error('SSR is not currently supported for Angular Rspack Module Federation. Please use webpack instead.');
    }
}
