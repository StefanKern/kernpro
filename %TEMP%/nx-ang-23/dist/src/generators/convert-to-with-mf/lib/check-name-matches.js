"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkOutputNameMatchesProjectName = checkOutputNameMatchesProjectName;
const internal_1 = require("@nx/js/internal");
function checkOutputNameMatchesProjectName(sourceFile, projectName) {
    (0, internal_1.ensureTypescript)();
    const { query } = require('@phenomnomnominal/tsquery');
    const OUTPUT_SELECTOR = 'PropertyAssignment:has(Identifier[name=output]) > ObjectLiteralExpression:has(PropertyAssignment:has(Identifier[name=uniqueName]))';
    const UNIQUENAME_SELECTOR = 'ObjectLiteralExpression > PropertyAssignment:has(Identifier[name=uniqueName]) > StringLiteral';
    const outputNodes = query(sourceFile, OUTPUT_SELECTOR);
    if (outputNodes.length === 0) {
        // If the output isnt set in the config, then we can still set the project name correctly
        return true;
    }
    const uniqueNameNodes = query(outputNodes[0], UNIQUENAME_SELECTOR);
    if (uniqueNameNodes.length === 0) {
        // If the uniqeName isnt set in the config, then we can still set the project name correctly
        return true;
    }
    const uniqueName = uniqueNameNodes[0].getText().replace(/'/g, '');
    return uniqueName === projectName;
}
