"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeOptions = normalizeOptions;
function normalizeOptions(schema) {
    return {
        ...schema,
        host: schema.host ?? 'localhost',
        port: schema.port ?? 4200,
        liveReload: schema.liveReload ?? true,
        hmr: schema.hmr,
        open: schema.open ?? false,
        ssl: schema.ssl ?? false,
        watchDependencies: schema.watchDependencies ?? true,
    };
}
