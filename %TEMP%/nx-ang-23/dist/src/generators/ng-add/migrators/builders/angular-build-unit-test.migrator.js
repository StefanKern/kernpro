"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AngularBuildUnitTestMigrator = void 0;
const devkit_1 = require("@nx/devkit");
const js_1 = require("@nx/js");
const path_1 = require("path");
const builder_migrator_1 = require("./builder.migrator");
class AngularBuildUnitTestMigrator extends builder_migrator_1.BuilderMigrator {
    constructor(tree, project, projectConfig, logger) {
        const rootFileType = determineRootFileType(projectConfig);
        super(tree, ['@angular/build:unit-test'], rootFileType, project, projectConfig, logger);
    }
    migrate() {
        if (this.skipMigration) {
            return;
        }
        for (const [name, target] of this.targets) {
            this.moveConfigFiles(target);
            this.updateTargetConfiguration(name, target);
            this.updateTsConfigFileUsedByTestTarget(name, target);
            this.updateCacheableOperations([name]);
        }
        if (!this.targets.size && this.projectConfig.root === '') {
            this.handleRootProjectConfigFiles();
        }
    }
    moveConfigFiles(target) {
        const filePathOptions = ['tsConfig'];
        if (typeof target.options?.runnerConfig === 'string') {
            filePathOptions.push('runnerConfig');
        }
        if (target.options?.providersFile) {
            filePathOptions.push('providersFile');
        }
        this.moveFilePathsFromTargetToProjectRoot(target, filePathOptions);
        if (Array.isArray(target.options?.setupFiles)) {
            target.options.setupFiles.forEach((file) => {
                if (this.tree.exists(file)) {
                    this.moveProjectRootFile(file);
                }
            });
        }
        if (Array.isArray(target.options?.reporters)) {
            this.moveCustomReporterFiles(target.options.reporters);
        }
        for (const config of Object.values(target.configurations ?? {})) {
            if (Array.isArray(config.reporters)) {
                this.moveCustomReporterFiles(config.reporters);
            }
        }
    }
    moveCustomReporterFiles(reporters) {
        reporters.forEach((reporter) => {
            const reporterPath = Array.isArray(reporter) ? reporter[0] : reporter;
            if (typeof reporterPath === 'string' &&
                reporterPath.includes('/') &&
                this.tree.exists(reporterPath)) {
                this.moveProjectRootFile(reporterPath);
            }
        });
    }
    updateTargetConfiguration(targetName, target) {
        if (!target.options) {
            this.logger.warn(`The target "${targetName}" is not specifying any options. Skipping updating the target configuration.`);
            return;
        }
        this.updateConfigurationOptions(target.options);
        for (const config of Object.values(target.configurations ?? {})) {
            this.updateConfigurationOptions(config);
        }
        (0, devkit_1.updateProjectConfiguration)(this.tree, this.project.name, {
            ...this.projectConfig,
        });
    }
    updateConfigurationOptions(options) {
        if (options.tsConfig || options.tsconfig) {
            const tsConfigKey = options.tsConfig ? 'tsConfig' : 'tsconfig';
            options[tsConfigKey] = (0, devkit_1.joinPathFragments)(this.project.newRoot, (0, path_1.basename)(options[tsConfigKey]));
        }
        if (typeof options.runnerConfig === 'string') {
            options.runnerConfig = (0, devkit_1.joinPathFragments)(this.project.newRoot, (0, path_1.basename)(options.runnerConfig));
        }
        if (options.outputFile) {
            options.outputFile = this.convertRootPath(options.outputFile);
        }
        if (options.providersFile) {
            options.providersFile = this.convertAsset(options.providersFile);
        }
        if (Array.isArray(options.setupFiles)) {
            options.setupFiles = options.setupFiles.map((file) => this.convertAsset(file));
        }
        if (Array.isArray(options.reporters)) {
            options.reporters = this.updateReporterPaths(options.reporters);
        }
    }
    updateReporterPaths(reporters) {
        return reporters.map((reporter) => {
            if (Array.isArray(reporter)) {
                const [reporterPath, reporterOptions] = reporter;
                if (typeof reporterPath === 'string' && reporterPath.includes('/')) {
                    return [this.convertAsset(reporterPath), reporterOptions];
                }
                return reporter;
            }
            else if (typeof reporter === 'string' && reporter.includes('/')) {
                return this.convertAsset(reporter);
            }
            return reporter;
        });
    }
    updateTsConfigFileUsedByTestTarget(targetName, target) {
        if (!target.options?.tsConfig) {
            this.logger.warn(`The "${targetName}" target does not have the "tsConfig" option configured. Skipping updating the tsConfig file.`);
            return;
        }
        if (!this.tree.exists(target.options.tsConfig)) {
            const originalTsConfigPath = this.originalProjectConfig.targets[targetName].options.tsConfig;
            this.logger.warn(`The tsConfig file "${originalTsConfigPath}" specified in the "${targetName}" target could not be found. Skipping updating the tsConfig file.`);
            return;
        }
        this.updateTsConfigFile(target.options.tsConfig, (0, js_1.getRootTsConfigPathInTree)(this.tree), (0, devkit_1.offsetFromRoot)(this.projectConfig.root));
    }
    handleRootProjectConfigFiles() {
        const runner = this.getRunnerOption();
        if (runner === 'karma') {
            const karmaConfig = 'karma.conf.js';
            if (this.tree.exists(karmaConfig)) {
                this.logger.info('No "test" target was found, but a root Karma config file was found in the project root. The file will be moved to the new location.');
                this.moveProjectRootFile(karmaConfig);
            }
        }
        else {
            const vitestConfigs = ['vitest.config.ts', 'vitest.config.js'];
            for (const vitestConfig of vitestConfigs) {
                if (this.tree.exists(vitestConfig)) {
                    this.logger.info('No "test" target was found, but a root Vitest config file was found in the project root. The file will be moved to the new location.');
                    this.moveProjectRootFile(vitestConfig);
                    break;
                }
            }
        }
    }
    getRunnerOption() {
        for (const [, target] of this.targets) {
            if (target.options?.runner) {
                return target.options.runner;
            }
        }
        return 'vitest';
    }
}
exports.AngularBuildUnitTestMigrator = AngularBuildUnitTestMigrator;
function determineRootFileType(projectConfig) {
    const testTargets = Object.values(projectConfig.targets ?? {}).filter((target) => target.executor === '@angular/build:unit-test');
    for (const target of testTargets) {
        if (target.options?.runner === 'karma') {
            return 'karma';
        }
    }
    return undefined;
}
