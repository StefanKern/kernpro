"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertScamToStandalone = convertScamToStandalone;
const devkit_1 = require("@nx/devkit");
const path_1 = require("path");
const version_utils_1 = require("../../utils/version-utils");
function convertScamToStandalone(componentAST, componentFileContents, importsArray, providersArray, moduleNodes, tree, normalizedComponentPath, componentName) {
    let newComponentContents = '';
    const COMPONENT_PROPERTY_SELECTOR = 'ClassDeclaration > Decorator > CallExpression:has(Identifier[name=Component]) ObjectLiteralExpression';
    const { query } = require('@phenomnomnominal/tsquery');
    const componentDecoratorMetadataNode = query(componentAST, COMPONENT_PROPERTY_SELECTOR)[0];
    const { major: angularMajorVersion } = (0, version_utils_1.getInstalledAngularVersionInfo)(tree);
    newComponentContents = `${componentFileContents.slice(0, componentDecoratorMetadataNode.getStart() - 1)}({
    imports: [${importsArray.join(',')}],${providersArray.length > 0
        ? `providers: [${providersArray.join(',')}],`
        : ''}${componentFileContents.slice(componentDecoratorMetadataNode.getStart() + 1, moduleNodes[0].getStart() - 1)}`;
    tree.write(normalizedComponentPath, newComponentContents);
    const componentPathParts = (0, path_1.parse)(normalizedComponentPath);
    const pathToComponentSpec = (0, devkit_1.joinPathFragments)(componentPathParts.dir, '/', `${componentPathParts.name}.spec.ts`);
    if (tree.exists(pathToComponentSpec)) {
        const componentSpecContents = tree.read(pathToComponentSpec, 'utf-8');
        // Only support testbed based tests
        if (componentSpecContents.includes('TestBed')) {
            let newComponentSpecContents = componentSpecContents;
            if (componentSpecContents.includes('imports: [')) {
                newComponentSpecContents = newComponentSpecContents.replace('imports: [', `imports: [${componentName}, `);
                newComponentSpecContents.replace(/declarations: \[.+/, '');
            }
            else {
                newComponentSpecContents = newComponentSpecContents.replace('declarations: [', 'imports: [');
            }
            tree.write(pathToComponentSpec, newComponentSpecContents);
        }
    }
}
