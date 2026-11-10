"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isHostRemoteConfig = isHostRemoteConfig;
exports.getRemotesFromHost = getRemotesFromHost;
exports.getExposedModulesFromRemote = getExposedModulesFromRemote;
const internal_1 = require("@nx/js/internal");
const REMOTES_EXPRESSION_SELECTOR = 'PropertyAssignment:has(Identifier[name=remotes]) > ObjectLiteralExpression';
const EXPOSES_EXPRESSION_SELECTOR = 'PropertyAssignment:has(Identifier[name=exposes]) > ObjectLiteralExpression';
const PROPERTY_SELECTOR = 'ObjectLiteralExpression > PropertyAssignment';
function isHostRemoteConfig(sourceFile) {
    let isHost = false;
    let isRemote = false;
    (0, internal_1.ensureTypescript)();
    const { query } = require('@phenomnomnominal/tsquery');
    const remotesNodes = query(sourceFile, REMOTES_EXPRESSION_SELECTOR);
    if (remotesNodes.length > 0) {
        isHost = true;
    }
    const exposesNodes = query(sourceFile, EXPOSES_EXPRESSION_SELECTOR);
    if (exposesNodes.length > 0) {
        isRemote = true;
    }
    let result = isHost && isRemote ? 'both' : isHost ? 'host' : isRemote ? 'remote' : false;
    return result;
}
function getRemotesFromHost(sourceFile) {
    (0, internal_1.ensureTypescript)();
    const { query } = require('@phenomnomnominal/tsquery');
    const remotesObjectNodes = query(sourceFile, REMOTES_EXPRESSION_SELECTOR);
    if (remotesObjectNodes.length === 0) {
        return [];
    }
    const remotesNodes = query(remotesObjectNodes[0], PROPERTY_SELECTOR);
    if (remotesNodes.length === 0) {
        return [];
    }
    const remotes = [];
    for (const remoteNode of remotesNodes) {
        const remoteText = remoteNode.getText();
        const remoteParts = remoteText
            .split(':')
            .map((part) => part.trim().replace(/'/g, ''));
        const remoteName = remoteParts.shift();
        const remoteLocation = remoteParts.join(':').replace(/\/[^\/]+$/, '');
        remotes.push([remoteName, remoteLocation]);
    }
    return remotes;
}
function getExposedModulesFromRemote(sourceFile) {
    (0, internal_1.ensureTypescript)();
    const { query } = require('@phenomnomnominal/tsquery');
    const exposesObjectNodes = query(sourceFile, EXPOSES_EXPRESSION_SELECTOR);
    if (exposesObjectNodes.length === 0) {
        return {};
    }
    return exposesObjectNodes[0].getText();
}
