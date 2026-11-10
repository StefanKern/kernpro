import { type Tree } from '@nx/devkit';
export default function migrateCreateNodesV2ToCreateNodes(tree: Tree): Promise<void>;
/**
 * Rewrites named imports and re-exports of `createNodesV2` to `createNodes`
 * when they come from one of the given module specifiers. Only the named
 * bindings are touched — the module specifier, the `import`/`export` keyword,
 * any `type` modifier, and any default import are left untouched.
 */
export declare function rewriteCreateNodesV2Imports(source: string, specifiers: ReadonlySet<string>): string;
