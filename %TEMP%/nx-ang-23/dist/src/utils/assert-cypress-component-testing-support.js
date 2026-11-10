"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertCypressComponentTestingSupport = assertCypressComponentTestingSupport;
exports.findCypressBelow = findCypressBelow;
const devkit_1 = require("@nx/devkit");
const internal_1 = require("@nx/devkit/internal");
const semver_1 = require("semver");
const minCypressVersion = '15.20.1';
/**
 * Asserts the workspace's Cypress version can run Component Testing against its
 * Angular version. Must be called after `@nx/cypress` has been ensured.
 */
function assertCypressComponentTestingSupport(tree) {
    const angularVersion = (0, internal_1.getResolvedPackageVersion)(tree, '@angular/core');
    if (!angularVersion) {
        return;
    }
    // A prerelease of 22.1 counts as 22.1.
    const angularRelease = (0, semver_1.coerce)(angularVersion)?.version ?? angularVersion;
    if ((0, semver_1.lt)(angularRelease, '22.1.0')) {
        return;
    }
    const found = findCypressBelow(tree, minCypressVersion);
    if (found) {
        throwForUnsupportedCypress(found);
    }
}
/**
 * Returns the installed Cypress version, or the declared range when nothing
 * satisfying is installed, if it cannot reach `floor`; `null` otherwise.
 *
 * A satisfying install decides. Without one, only a range capped below the
 * floor fails: `^15.17.0` installs 15.20.1+, so its lower bound cannot be
 * compared. Declarations that are not ranges (`latest`, `file:`) are not
 * gated.
 * When Cypress is not declared, the generators install `cypressVersion`.
 */
function findCypressBelow(tree, floor) {
    const { cypressVersion, } = require('@nx/cypress/internal');
    const declaredCypressVersion = (0, devkit_1.getDependencyVersionFromPackageJson)(tree, 'cypress');
    const installedCypressVersion = declaredCypressVersion
        ? (0, internal_1.getSatisfyingInstalledPackageVersion)(tree, 'cypress', declaredCypressVersion)
        : null;
    if (installedCypressVersion) {
        const release = (0, semver_1.coerce)(installedCypressVersion)?.version ?? installedCypressVersion;
        return (0, semver_1.lt)(release, floor) ? installedCypressVersion : null;
    }
    const range = declaredCypressVersion ?? cypressVersion;
    return (0, semver_1.validRange)(range) && (0, semver_1.subset)(range, `<${floor}`) ? range : null;
}
function throwForUnsupportedCypress(found) {
    throw new Error(`Cypress Component Testing with Angular 22.1 and higher requires Cypress ${minCypressVersion} or higher. ` +
        `Found Cypress ${found}. Earlier Cypress versions can't load Angular's Babel 8 dependencies. ` +
        `Please upgrade Cypress. ` +
        `See https://github.com/cypress-io/cypress/issues/34461.`);
}
