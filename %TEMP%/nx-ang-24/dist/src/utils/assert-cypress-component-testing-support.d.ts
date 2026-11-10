import { type Tree } from '@nx/devkit';
/**
 * Asserts the workspace's Cypress version can run Component Testing against its
 * Angular version. Must be called after `@nx/cypress` has been ensured.
 */
export declare function assertCypressComponentTestingSupport(tree: Tree): void;
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
export declare function findCypressBelow(tree: Tree, floor: string): string | null;
