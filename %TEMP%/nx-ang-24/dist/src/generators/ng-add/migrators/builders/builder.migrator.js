"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BuilderMigrator = void 0;
const utilities_1 = require("../../utilities");
const migrator_1 = require("../migrator");
class BuilderMigrator extends migrator_1.Migrator {
    constructor(tree, possibleBuilderNames, rootFileType, project, projectConfig, logger) {
        super(tree, projectConfig, logger);
        this.possibleBuilderNames = possibleBuilderNames;
        this.rootFileType = rootFileType;
        this.targets = new Map();
        this.skipMigration = false;
        this.project = project;
        this.projectConfig = projectConfig;
        this.collectBuilderTargets();
    }
    validate() {
        const errors = [];
        // TODO(leo): keeping restriction until the full refactor is done and we start
        // expanding what's supported.
        if (this.targets.size > 1) {
            errors.push({
                message: `There is more than one target using the builder${this.possibleBuilderNames.length > 1 ? 's' : ''} ${(0, utilities_1.arrayToString)(this.possibleBuilderNames)}: ${(0, utilities_1.arrayToString)([
                    ...this.targets.keys(),
                ])}. This is not currently supported by the automated migration. These targets will be skipped.`,
                hint: 'Make sure to manually migrate their configuration and any possible associated files.',
            });
            this.skipMigration = true;
        }
        return errors.length ? errors : null;
    }
    isBuilderUsed() {
        return this.targets.size > 0;
    }
    collectBuilderTargets() {
        for (const [name, target] of Object.entries(this.projectConfig.targets ?? {})) {
            if (this.possibleBuilderNames.includes(target.executor)) {
                this.targets.set(name, target);
            }
        }
    }
}
exports.BuilderMigrator = BuilderMigrator;
