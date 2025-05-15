const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const extensionDir = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(extensionDir, '../..');
const pluginDir = path.join(workspaceRoot, 'packages/stylelint-oldfashioned-order');
const extensionNodeModules = path.join(extensionDir, 'node_modules');

console.log('Preparing VS Code extension dependencies...');

// Make sure the plugin is built
try {
    console.log('Building stylelint-oldfashioned-order...');
    execSync('nx build stylelint-oldfashioned-order', { stdio: 'inherit', cwd: workspaceRoot });
} catch (err) {
    console.error('Error building plugin:', err.message);
    process.exit(1);
}

// Ensure node_modules exists
if (!fs.existsSync(extensionNodeModules)) {
    fs.mkdirSync(extensionNodeModules, { recursive: true });
}

// Copy the plugin to the extension's node_modules
const pluginNodeModulesDir = path.join(extensionNodeModules, 'stylelint-oldfashioned-order');
if (!fs.existsSync(pluginNodeModulesDir)) {
    fs.mkdirSync(pluginNodeModulesDir, { recursive: true });
}

// Copy necessary files
try {
    // Create the dist directory structure
    fs.mkdirSync(path.join(pluginNodeModulesDir, 'dist/src'), { recursive: true });

    // Copy the built index.js file
    fs.copyFileSync(
        path.join(pluginDir, 'dist/src/index.js'),
        path.join(pluginNodeModulesDir, 'dist/src/index.js')
    );

    // Copy package.json
    fs.copyFileSync(
        path.join(pluginDir, 'package.json'),
        path.join(pluginNodeModulesDir, 'package.json')
    );

    console.log('Successfully prepared extension dependencies');
} catch (err) {
    console.error('Error copying files:', err);
    process.exit(1);
}
