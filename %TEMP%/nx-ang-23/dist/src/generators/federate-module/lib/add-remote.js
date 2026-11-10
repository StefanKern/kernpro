"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addRemote = addRemote;
const tslib_1 = require("tslib");
const internal_1 = require("@nx/devkit/internal");
const test_runners_1 = require("../../../utils/test-runners");
const remote_1 = tslib_1.__importDefault(require("../../remote/remote"));
const check_remote_exists_1 = require("./check-remote-exists");
async function addRemote(tree, schema) {
    const tasks = [];
    const remote = (0, check_remote_exists_1.getRemoteIfExists)(tree, schema.remote);
    let projectRoot, remoteName;
    if (!remote) {
        const remoteGeneratorCallback = await (0, remote_1.default)(tree, {
            name: schema.remote,
            directory: schema.remoteDirectory,
            host: schema.host,
            standalone: schema.standalone,
            unitTestRunner: schema.unitTestRunner,
            e2eTestRunner: schema.e2eTestRunner ?? test_runners_1.E2eTestRunner.Cypress,
            skipFormat: true,
        });
        tasks.push(remoteGeneratorCallback);
        const { projectName, projectRoot: remoteRoot } = await (0, internal_1.determineProjectNameAndRootOptions)(tree, {
            name: schema.remote,
            directory: schema.remoteDirectory,
            projectType: 'application',
        });
        projectRoot = remoteRoot;
        remoteName = projectName;
    }
    else {
        projectRoot = remote.root;
        remoteName = remote.name;
    }
    // TODO(Colum): add implicit dependency if the path points to a file in a different project
    return {
        tasks,
        projectRoot,
        remoteName,
    };
}
