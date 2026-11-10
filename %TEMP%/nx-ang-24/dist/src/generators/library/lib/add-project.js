"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addProject = addProject;
const internal_1 = require("@nx/devkit/internal");
const devkit_1 = require("@nx/devkit");
const internal_2 = require("@nx/js/internal");
async function addProject(tree, libraryOptions) {
    const project = {
        name: libraryOptions.name,
        root: libraryOptions.projectRoot,
        sourceRoot: (0, devkit_1.joinPathFragments)(libraryOptions.projectRoot, 'src'),
        prefix: libraryOptions.prefix,
        tags: libraryOptions.parsedTags,
        projectType: 'library',
        targets: {},
    };
    if (libraryOptions.buildable || libraryOptions.publishable) {
        const executor = libraryOptions.publishable
            ? '@nx/angular:package'
            : '@nx/angular:ng-packagr-lite';
        (0, internal_1.addBuildTargetDefaults)(tree, executor);
        project.targets.build = {
            executor,
            outputs: ['{workspaceRoot}/dist/{projectRoot}'],
            options: {
                project: `${libraryOptions.projectRoot}/ng-package.json`,
                tsConfig: `${libraryOptions.projectRoot}/tsconfig.lib.json`,
            },
            configurations: {
                production: {
                    tsConfig: `${libraryOptions.projectRoot}/tsconfig.lib.prod.json`,
                },
                development: {},
            },
            defaultConfiguration: 'production',
        };
        if (libraryOptions.publishable) {
            const nxJson = (0, devkit_1.readJson)(tree, 'nx.json');
            await (0, internal_2.addReleaseConfigForNonTsSolution)(tree, libraryOptions.name, project);
        }
    }
    (0, devkit_1.addProjectConfiguration)(tree, libraryOptions.name, project);
    return project;
}
