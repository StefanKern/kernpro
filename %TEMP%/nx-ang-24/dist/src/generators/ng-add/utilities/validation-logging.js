"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrayToString = arrayToString;
exports.getProjectValidationResultMessage = getProjectValidationResultMessage;
const tslib_1 = require("tslib");
const pc = tslib_1.__importStar(require("picocolors"));
function arrayToString(array) {
    if (array.length === 0) {
        return '';
    }
    if (array.length === 1) {
        return quote(array[0]);
    }
    const last = array[array.length - 1];
    const rest = array.slice(0, array.length - 1);
    return `${rest.map(quote).join(', ')} and ${quote(last)}`;
}
function getProjectValidationResultMessage(validationResult) {
    return `${pc.bold('Validation results')}:

  ${validationResult
        .map((error) => getValidationErrorText(error))
        .join('\n\n  ')}`;
}
function getValidationErrorText({ message, messageGroup, hint, }) {
    let lines = message
        ? [`- ${message}`, ...(hint ? [pc.dim(pc.italic(`  ${hint}`))] : [])]
        : [
            `- ${messageGroup.title}:`,
            '  - Errors:',
            ...messageGroup.messages.map((message) => `    - ${message}`),
            ...(hint ? [pc.dim(pc.italic(`  - ${hint}`))] : []),
        ];
    return lines.join('\n  ');
}
function quote(str) {
    return `"${str}"`;
}
