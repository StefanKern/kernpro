import type { ExecutorContext } from '@nx/devkit';
import type { UnitTestExecutorOptions } from './schema';
export default function unitTestExecutor(options: UnitTestExecutorOptions, context: ExecutorContext): AsyncGenerator<import("@angular-devkit/architect").BuilderOutput, any, any>;
