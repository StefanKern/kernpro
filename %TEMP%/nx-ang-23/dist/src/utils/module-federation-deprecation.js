"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ANGULAR_MF_DEV_SSR_EXECUTOR_DEPRECATION_MESSAGE = exports.ANGULAR_MF_DEV_SERVER_EXECUTOR_DEPRECATION_MESSAGE = void 0;
exports.warnAngularMfDevServerExecutorDeprecation = warnAngularMfDevServerExecutorDeprecation;
exports.warnAngularMfDevSsrExecutorDeprecation = warnAngularMfDevSsrExecutorDeprecation;
const devkit_1 = require("@nx/devkit");
// TODO(v24): Remove all Angular Module Federation surfaces from @nx/angular.
// Angular Native Federation (@angular-architects/native-federation) is the
// supported Angular MF path going forward; the new @nx/module-federation
// generators are React-only.
const MIGRATION_URL = 'https://nx.dev/docs/technologies/module-federation/consumer-and-provider';
const ANGULAR_NATIVE_FED_URL = 'https://www.npmjs.com/package/@angular-architects/native-federation';
const ANGULAR_MF_TRAILER = `Angular Module Federation in Nx is no longer supported. Use \`@angular-architects/native-federation\` (${ANGULAR_NATIVE_FED_URL}) for the supported Angular path. See ${MIGRATION_URL} for the v23 migration guide.`;
exports.ANGULAR_MF_DEV_SERVER_EXECUTOR_DEPRECATION_MESSAGE = `The \`@nx/angular:module-federation-dev-server\` executor is deprecated and will be removed in Nx v24. ${ANGULAR_MF_TRAILER}`;
exports.ANGULAR_MF_DEV_SSR_EXECUTOR_DEPRECATION_MESSAGE = `The \`@nx/angular:module-federation-dev-ssr\` executor is deprecated and will be removed in Nx v24. ${ANGULAR_MF_TRAILER}`;
// Executor warnings fire once per process to avoid flooding dev-server loops.
const executorWarned = new Set();
function warnOnce(key, message) {
    if (executorWarned.has(key))
        return;
    executorWarned.add(key);
    devkit_1.logger.warn(message);
}
function warnAngularMfDevServerExecutorDeprecation() {
    warnOnce('angular-mf-dev-server', exports.ANGULAR_MF_DEV_SERVER_EXECUTOR_DEPRECATION_MESSAGE);
}
function warnAngularMfDevSsrExecutorDeprecation() {
    warnOnce('angular-mf-dev-ssr', exports.ANGULAR_MF_DEV_SSR_EXECUTOR_DEPRECATION_MESSAGE);
}
