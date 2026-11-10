import { type Tree } from '@nx/devkit';
import type { Node, SourceFile } from 'typescript';
export declare function convertScamToStandalone(componentAST: SourceFile, componentFileContents: string, importsArray: string[], providersArray: string[], moduleNodes: Array<Node>, tree: Tree, normalizedComponentPath: string, componentName: string): void;
