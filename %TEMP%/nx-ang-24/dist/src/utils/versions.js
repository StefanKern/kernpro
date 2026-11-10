"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsoncEslintParserVersion = exports.oxcProjectRuntimeVersion = exports.jsdomVersion = exports.vitestVersion = exports.jasmineMarblesVersion = exports.typesNodeVersion = exports.jestPresetAngularVersion = exports.lessVersion = exports.tsNodeVersion = exports.autoprefixerVersion = exports.postcssUrlVersion = exports.postcssVersion = exports.typescriptEslintVersion = exports.angularEslintVersion = exports.webpackMergeVersion = exports.browserSyncVersion = exports.typesExpressVersion = exports.expressVersion = exports.tsLibVersion = exports.zoneJsVersion = exports.rxjsVersion = exports.ngrxVersion = exports.ngPackagrVersion = exports.angularDevkitVersion = exports.angularVersion = exports.nxVersion = void 0;
const path_1 = require("path");
exports.nxVersion = require((0, path_1.join)('@nx/angular', 'package.json')).version;
exports.angularVersion = '~22.2.0';
exports.angularDevkitVersion = '~22.2.0';
exports.ngPackagrVersion = '~22.2.0';
exports.ngrxVersion = '^22.0.0';
exports.rxjsVersion = '~7.8.0';
exports.zoneJsVersion = '~0.16.2';
exports.tsLibVersion = '^2.3.0';
exports.expressVersion = '^4.21.2';
exports.typesExpressVersion = '^4.17.21';
exports.browserSyncVersion = '^3.0.0';
exports.webpackMergeVersion = '^5.8.0';
exports.angularEslintVersion = '^22.5.0';
exports.typescriptEslintVersion = '^8.40.0';
exports.postcssVersion = '^8.4.5';
exports.postcssUrlVersion = '~10.1.3';
exports.autoprefixerVersion = '^10.4.0';
exports.tsNodeVersion = '10.9.1';
exports.lessVersion = '^4.3.0';
exports.jestPresetAngularVersion = '~17.0.0';
exports.typesNodeVersion = '^22.0.0';
exports.jasmineMarblesVersion = '^0.9.2';
exports.vitestVersion = '^4.0.8';
exports.jsdomVersion = '^27.1.0';
// `@analogjs/vite-plugin-angular` (vitest-analog path) registers an
// `angularVitestPlugin` whose `transform` hook downlevels `@angular/*`
// fesm2022 modules via `vite.transformWithOxc({ target: 'es2016', … })`
// so Zone.js `fakeAsync` can intercept async/await. The lowered code
// emits external `@oxc-project/runtime/helpers/*` imports (oxc default
// `HelperMode = 'Runtime'`). Nothing upstream declares the runtime, so
// we add it explicitly to user projects.
exports.oxcProjectRuntimeVersion = '^0.115.0';
exports.jsoncEslintParserVersion = '^2.1.0';
