"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectorExistsInAST = selectorExistsInAST;
function selectorExistsInAST(selector, sourceFile) {
    const { query } = require('@phenomnomnominal/tsquery');
    return query(sourceFile, selector).length > 0;
}
