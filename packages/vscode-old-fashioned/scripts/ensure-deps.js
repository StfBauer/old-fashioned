const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const extensionRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(extensionRoot, '../..');
const pluginDir = path.join(workspaceRoot, 'packages/stylelint-oldfashioned-order');
const pluginDistSrc = path.join(pluginDir, 'dist/src');
const moduleTarget = path.join(extensionRoot, 'node_modules/stylelint-oldfashioned-order');

console.log('Ensuring dependencies for VS Code extension...');

// Check if plugin is built
if (!fs.existsSync(path.join(pluginDistSrc, 'index.js'))) {
    console.log('Building stylelint-oldfashioned-order...');
    try {
        execSync('nx build stylelint-oldfashioned-order', { stdio: 'inherit', cwd: workspaceRoot });
    } catch (error) {
        console.error('Failed to build plugin:', error.message);
        process.exit(1);
    }
}

// Create module directory in extension node_modules
console.log('Setting up local module linkage...');
fs.mkdirSync(path.join(moduleTarget, 'dist/src'), { recursive: true });

// Copy the built files
try {
    fs.copyFileSync(
        path.join(pluginDistSrc, 'index.js'),
        path.join(moduleTarget, 'dist/src/index.js')
    );

    // Copy package.json
    fs.copyFileSync(
        path.join(pluginDir, 'package.json'),
        path.join(moduleTarget, 'package.json')
    );

    console.log('Dependencies successfully linked!');
} catch (err) {
    console.error('Error copying files:', err);
    process.exit(1);
}
