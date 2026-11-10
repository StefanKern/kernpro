"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.waitForDevServer = waitForDevServer;
const dev_server_ready_check_1 = require("./src/plugins/utils/dev-server-ready-check");
async function waitForDevServer(workspaceConfigPath) {
    await (0, dev_server_ready_check_1.waitForAngularDevServer)(workspaceConfigPath);
    process.exit(0);
}
