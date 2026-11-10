"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSnippet = addSnippet;
const devkit_1 = require("@nx/devkit");
function addSnippet(tree, name, path) {
    const fileRegExp = new RegExp(`^${name}.*\\.ts`);
    const siblingModules = tree
        .children(path)
        .filter((f) => fileRegExp.test(f) &&
        !/\.(module|spec|config|routes)\.ts$/.test(f) &&
        !f.endsWith('.worker.ts'))
        .sort();
    if (siblingModules.length === 0) {
        return;
    }
    const logMessage = 'console.log(`page got message ${data}`);';
    const workerCreationSnippet = (0, devkit_1.stripIndents) `
      if (typeof Worker !== 'undefined') {
        // Create a new
        const worker = new Worker(new URL('./${name}.worker', import.meta.url));
        worker.onmessage = ({ data }) => {
          ${logMessage}
        };
        worker.postMessage('hello');
      } else {
        // Web Workers are not supported in this environment.
        // You should add a fallback so that your program still executes correctly.
      }
    `;
    // Add snippet to the first alphabetically sorted sibling file
    const siblingModulePath = (0, devkit_1.joinPathFragments)(path, siblingModules[0]);
    const originalContent = tree.read(siblingModulePath, 'utf-8');
    const newContent = originalContent.trim()
        ? `${originalContent}\n${workerCreationSnippet}`
        : workerCreationSnippet;
    tree.write(siblingModulePath, newContent);
}
