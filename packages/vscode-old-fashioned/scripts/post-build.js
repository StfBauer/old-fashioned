const fs = require('fs');
const path = require('path');

// Path constants
const extensionDir = __dirname;
const distDir = path.join(extensionDir, '..', 'dist');
const nodeModulesDir = path.join(extensionDir, '..', 'node_modules');
const packageJsonPath = path.join(extensionDir, '..', 'package.json');

console.log('Running post-build checks for VS Code extension...');

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
    console.error('Error: dist directory not found!');
    process.exit(1);
}

// Check for extension.js
const extensionJsPath = path.join(distDir, 'extension.js');
if (!fs.existsSync(extensionJsPath)) {
    console.error('Error: extension.js not found in dist directory!');
    process.exit(1);
}

// Check for node_modules
if (!fs.existsSync(nodeModulesDir)) {
    console.log('Warning: node_modules directory not found. Dependencies may be missing.');
}

console.log('Post-build checks complete.');
