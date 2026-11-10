"use strict";
// Semi-private surface for first-party Nx packages.
//
// External plugins should NOT import from here — this entry is curated for
// internal consumers and may change without semver protection. Mirrors
// `@nx/devkit/internal`.
//
// These mirror the previously-public `@nx/angular/src/utils`,
// `@nx/angular/src/generators/utils` and `@nx/angular/src/generators/move/move-impl`
// subpaths (removed from the exports map in 23.0.0). The
// `rewrite-internal-subpath-imports` migration routes consumers of those
// subpaths here, so every symbol they exposed must be re-exported.
Object.defineProperty(exports, "__esModule", { value: true });
exports.move = void 0;
const tslib_1 = require("tslib");
tslib_1.__exportStar(require("./src/utils"), exports);
tslib_1.__exportStar(require("./src/generators/utils"), exports);
var move_impl_1 = require("./src/generators/move/move-impl");
Object.defineProperty(exports, "move", { enumerable: true, get: function () { return move_impl_1.move; } });
