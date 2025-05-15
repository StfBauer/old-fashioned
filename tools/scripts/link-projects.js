/**
 * This script ensures proper linking between projects after build
 */
const fs = require('fs');
const path = require('path');

// Ensure the stylelint-oldfashioned-order package is properly symlinked
const srcPath = path.resolve(__dirname, '../../packages/stylelint-oldfashioned-order');
const destPath = path.resolve(__dirname, '../../node_modules/stylelint-oldfashioned-order');

// Create node_modules directory if it doesn't exist
if (!fs.existsSync(path.dirname(destPath))) {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
}

// Remove existing symlink or directory if it exists
if (fs.existsSync(destPath)) {
    if (fs.lstatSync(destPath).isSymbolicLink()) {
        fs.unlinkSync(destPath);
    } else {
        require('rimraf').sync(destPath);
    }
}

// Create symlink
try {
    fs.symlinkSync(srcPath, destPath, 'junction');
    console.log(`Successfully linked ${srcPath} to ${destPath}`);
} catch (error) {
    console.error(`Failed to link projects: ${error.message}`);
}
