const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const extensionRoot = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(extensionRoot, '../..');
const pluginDir = path.join(workspaceRoot, 'packages/stylelint-oldfashioned-order');
const pluginDistDir = path.join(pluginDir, 'dist/src');
const pluginNodeModulesDir = path.join(extensionRoot, 'node_modules/stylelint-oldfashioned-order/dist/src');

// Ensure target directories exist
if (!fs.existsSync(path.dirname(pluginNodeModulesDir))) {
    fs.mkdirSync(path.dirname(pluginNodeModulesDir), { recursive: true });
}

// Build plugin if needed
if (!fs.existsSync(path.join(pluginDistDir, 'index.js'))) {
    console.log('Building stylelint-oldfashioned-order plugin...');
    try {
        execSync('nx build stylelint-oldfashioned-order', {
            cwd: workspaceRoot,
            stdio: 'inherit'
        });
    } catch (err) {
        console.error('Failed to build plugin:', err);
        process.exit(1);
    }
}

// Copy built files to extension's node_modules
console.log('Copying plugin files to extension node_modules...');
fs.mkdirSync(pluginNodeModulesDir, { recursive: true });
fs.copyFileSync(
    path.join(pluginDistDir, 'index.js'),
    path.join(pluginNodeModulesDir, 'index.js')
);

// Copy package.json
fs.copyFileSync(
    path.join(pluginDir, 'package.json'),
    path.join(path.dirname(path.dirname(pluginNodeModulesDir)), 'package.json')
);

console.log('Plugin files successfully copied');
