import * as path from 'path';
import * as fs from 'fs';
import * as vscode from 'vscode';

/**
 * Safely load a module with proper error handling
 */
export function safeLoadModule(moduleName: string, context: vscode.ExtensionContext) {
    const logger = vscode.window.createOutputChannel('Module Loader');

    try {
        // Try multiple resolution strategies

        // 1. First try direct require
        try {
            return require(moduleName);
        } catch (err) {
            logger.appendLine(`Direct require failed for ${moduleName}: ${err}`);
        }

        // 2. Try with extension path
        const extModulePath = path.join(context.extensionPath, 'node_modules', moduleName);
        if (fs.existsSync(extModulePath)) {
            try {
                return require(extModulePath);
            } catch (err) {
                logger.appendLine(`Extension path require failed for ${extModulePath}: ${err}`);
            }
        } else {
            logger.appendLine(`Module not found at ${extModulePath}`);
        }

        // 3. Try to find it in the workspace
        const workspaceModulePath = path.join(context.extensionPath, '..', '..', 'node_modules', moduleName);
        if (fs.existsSync(workspaceModulePath)) {
            try {
                return require(workspaceModulePath);
            } catch (err) {
                logger.appendLine(`Workspace path require failed for ${workspaceModulePath}: ${err}`);
            }
        }

        // If all else fails, return a mock module
        logger.appendLine(`Failed to load module ${moduleName}, returning mock`);
        return createMockModule(moduleName);
    } catch (error) {
        logger.appendLine(`Fatal error loading ${moduleName}: ${error}`);
        return createMockModule(moduleName);
    }
}

/**
 * Create a mock module to prevent crashes
 */
function createMockModule(moduleName: string) {
    return {
        __mock: true,
        name: moduleName
    };
}
