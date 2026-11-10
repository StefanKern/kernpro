import type { BuilderOutput } from '@angular-devkit/architect';
import type { ExecutorContext } from '@nx/devkit';
import type { ApplicationExecutorOptions } from './schema';
export default function applicationExecutor(options: ApplicationExecutorOptions, context: ExecutorContext): AsyncIterable<BuilderOutput>;
