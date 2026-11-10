import type { buildApplication } from '@angular/build';
type Plugin = Parameters<typeof buildApplication>[2]['codePlugins'][number];
export type PluginSpec = {
    path: string;
    options: any;
};
export declare function loadPlugins(plugins: string[] | PluginSpec[] | undefined, tsConfig: string): Promise<Plugin[]>;
export declare function loadMiddleware(middlewareFns: string[] | undefined, tsConfig: string): Promise<any[]>;
export declare function loadIndexHtmlTransformer(indexHtmlTransformerPath: string, tsConfig: string): Promise<any>;
export {};
