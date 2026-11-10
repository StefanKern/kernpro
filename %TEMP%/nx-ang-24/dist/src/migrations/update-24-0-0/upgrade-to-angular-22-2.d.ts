import { type Tree } from '@nx/devkit';
export default function upgradeToAngular222(tree: Tree): Promise<{
    nextSteps: string[];
    agentContext: string[];
}>;
