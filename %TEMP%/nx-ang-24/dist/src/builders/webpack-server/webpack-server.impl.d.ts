import type { BuilderContext } from '@angular-devkit/architect';
import type { ServerBuilderOutput } from '@angular-devkit/build-angular';
import { Observable } from 'rxjs';
import { Schema } from './schema';
export declare function executeWebpackServerBuilder(options: Schema, context: BuilderContext): Observable<ServerBuilderOutput>;
declare const _default: any;
export default _default;
