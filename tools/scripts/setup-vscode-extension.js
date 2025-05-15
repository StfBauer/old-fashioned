const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const workspaceRoot = path.resolve(__dirname, '../..');
const extensionDir = path.join(workspaceRoot, 'packages/vscode-old-fashioned');
const styleLintPluginDir = path.join(workspaceRoot, 'packages/stylelint-oldfashioned-order');

// Ensure the stylelint plugin is built
console.log('Building stylelint-oldfashioned-order plugin...');
try {
    execSync('nx build stylelint-oldfashioned-order', { stdio: 'inherit', cwd: workspaceRoot });
} catch (error) {
    console.error('Failed to build stylelint plugin:', error.message);
    process.exit(1);
}

// Create the node_modules directory in the extension if it doesn't exist
const extensionNodeModules = path.join(extensionDir, 'node_modules');
const pluginNodeModulesPath = path.join(extensionNodeModules, 'stylelint-oldfashioned-order');

if (!fs.existsSync(extensionNodeModules)) {
    fs.mkdirSync(extensionNodeModules, { recursive: true });
}

// Remove existing plugin if it exists
if (fs.existsSync(pluginNodeModulesPath)) {
    console.log('Removing existing plugin installation...');
    fs.rmSync(pluginNodeModulesPath, { recursive: true, force: true });
}

// Copy the built plugin to the extension's node_modules
console.log('Installing plugin in extension...');
fs.mkdirSync(pluginNodeModulesPath, { recursive: true });

// Copy package.json
fs.copyFileSync(
    path.join(styleLintPluginDir, 'package.json'),
    path.join(pluginNodeModulesPath, 'package.json')
);

// Create dist directory structure
const distDir = path.join(pluginNodeModulesPath, 'dist/src');
fs.mkdirSync(distDir, { recursive: true });

// Copy the built file
fs.copyFileSync(
    path.join(styleLintPluginDir, 'dist/src/index.js'),
    path.join(distDir, 'index.js')
);

console.log('Setup completed successfully!');
