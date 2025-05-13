#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Setup paths for ES modules (since __dirname is not available in ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path setup
const rootDir = path.resolve(__dirname, '../..');
const sharedDistDir = path.join(rootDir, 'dist/packages/shared');
const pluginDir = path.join(rootDir, 'packages/stylelint-oldfashioned-order');
const pluginDistDir = path.join(pluginDir, 'dist');
const pluginLibDir = path.join(pluginDistDir, 'lib');

console.log('Bundle paths:');
console.log('- Root directory:', rootDir);
console.log('- Shared dist:', sharedDistDir);
console.log('- Plugin directory:', pluginDir);
console.log('- Plugin dist:', pluginDistDir);
console.log('- Plugin lib:', pluginLibDir);

console.log('Bundling shared package into stylelint-oldfashioned-order...');

try {
    // Create output directories
    if (!fs.existsSync(pluginDistDir)) {
        fs.mkdirSync(pluginDistDir, { recursive: true });
        console.log('Created plugin dist directory:', pluginDistDir);
    }

    if (!fs.existsSync(pluginLibDir)) {
        fs.mkdirSync(pluginLibDir, { recursive: true });
        console.log('Created plugin lib directory:', pluginLibDir);
    }

    // Copy compiled files from Nx default output to our target location
    const nxPluginDistDir = path.join(rootDir, 'dist/packages/stylelint-oldfashioned-order');
    if (fs.existsSync(nxPluginDistDir) && nxPluginDistDir !== pluginDistDir) {
        console.log('Copying compiled files from Nx output:', nxPluginDistDir);
        copyDirectory(nxPluginDistDir, pluginDistDir);
    }

    // Copy shared package files
    console.log('Copying shared files...');
    if (fs.existsSync(sharedDistDir)) {
        fs.readdirSync(sharedDistDir).forEach(file => {
            if (file.endsWith('.js') || file.endsWith('.d.ts')) {
                fs.copyFileSync(
                    path.join(sharedDistDir, file),
                    path.join(pluginLibDir, file)
                );
            }
        });
    } else {
        console.warn('Warning: Shared package dist directory not found at', sharedDistDir);
    }

    // Update imports
    console.log('Updating imports...');
    getAllFiles(pluginDistDir, ['.js']).forEach(file => {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(
            /require\(['"]@old-fashioned\/shared['"]\)/g,
            'require("./lib/index")'
        );
        content = content.replace(
            /from ['"]@old-fashioned\/shared['"]/g,
            'from "./lib/index"'
        );
        fs.writeFileSync(file, content);
    });

    // Prepare package.json
    console.log('Preparing package.json...');
    const packageJsonPath = path.join(pluginDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.dependencies && packageJson.dependencies['@old-fashioned/shared']) {
            delete packageJson.dependencies['@old-fashioned/shared'];
        }
        fs.writeFileSync(
            path.join(pluginDistDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );
    }

    // Copy README and LICENSE
    ['README.md', 'LICENSE.md'].forEach(file => {
        const sourcePath = path.join(pluginDir, file);
        if (fs.existsSync(sourcePath)) {
            fs.copyFileSync(sourcePath, path.join(pluginDistDir, file));
            console.log(`Copied ${file} to dist`);
        }
    });

    console.log('Bundle completed successfully! Output at:', pluginDistDir);

    // Create a test file to verify output directory exists
    fs.writeFileSync(path.join(pluginDistDir, '.nx-output'), 'Output directory created successfully');

} catch (error) {
    console.error('Error during bundling:', error);
    process.exit(1);
}

// Helper functions
function getAllFiles(dir, extensions = []) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath, extensions));
        } else if (extensions.length === 0 || extensions.some(ext => file.endsWith(ext))) {
            results.push(filePath);
        }
    });
    return results;
}

function copyDirectory(source, destination) {
    if (!fs.existsSync(source)) {
        console.warn('Source directory does not exist:', source);
        return;
    }

    if (!fs.existsSync(destination)) {
        fs.mkdirSync(destination, { recursive: true });
    }

    fs.readdirSync(source).forEach(file => {
        const sourcePath = path.join(source, file);
        const destPath = path.join(destination, file);

        if (fs.statSync(sourcePath).isDirectory()) {
            copyDirectory(sourcePath, destPath);
        } else {
            fs.copyFileSync(sourcePath, destPath);
        }
    });

    console.log(`Copied directory ${source} to ${destination}`);
}
