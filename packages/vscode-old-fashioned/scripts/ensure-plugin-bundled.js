/**
 * This script ensures that the stylelint-oldfashioned-order plugin is correctly bundled
 * with the VS Code extension. It copies the built plugin into the extension's node_modules.
 */

const fs = require('fs');
const path = require('path');

// Paths
const extensionPath = __dirname;
const pluginSrcPath = path.resolve(__dirname, '../../stylelint-oldfashioned-order/dist');
const pluginDestPath = path.resolve(__dirname, '../node_modules/stylelint-oldfashioned-order');

// Create directory if it doesn't exist
if (!fs.existsSync(pluginDestPath)) {
    fs.mkdirSync(pluginDestPath, { recursive: true });
    console.log(`Created directory: ${pluginDestPath}`);
}

// Copy package.json with corrected main entry point
const packageJsonSrc = path.resolve(__dirname, '../../stylelint-oldfashioned-order/package.json');
const packageJsonContent = JSON.parse(fs.readFileSync(packageJsonSrc, 'utf8'));

// Make sure the main entry points to the correct file
packageJsonContent.main = 'dist/src/index.js';

// Write the updated package.json
const packageJsonDest = path.resolve(pluginDestPath, 'package.json');
fs.writeFileSync(packageJsonDest, JSON.stringify(packageJsonContent, null, 2));
console.log(`Created updated package.json at: ${packageJsonDest}`);

// Copy dist folder contents
const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
            console.log(`Copied: ${srcPath} -> ${destPath}`);
        }
    }
};

if (fs.existsSync(pluginSrcPath)) {
    // Create dist folder in the destination
    const destDistPath = path.resolve(pluginDestPath, 'dist');
    if (!fs.existsSync(destDistPath)) {
        fs.mkdirSync(destDistPath, { recursive: true });
    }

    copyDir(pluginSrcPath, destDistPath);
    console.log('Plugin files copied successfully!');

    // Verify the file structure
    console.log('\nVerifying plugin structure:');
    const mainFile = path.join(pluginDestPath, packageJsonContent.main);
    if (fs.existsSync(mainFile)) {
        console.log(`✅ Main entry point exists: ${mainFile}`);
    } else {
        console.error(`❌ Main entry point missing: ${mainFile}`);
    }
} else {
    console.error(`Plugin source path does not exist: ${pluginSrcPath}`);
    process.exit(1);
}

console.log('\nPlugin bundling complete!');
