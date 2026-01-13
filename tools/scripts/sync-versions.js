#!/usr/bin/env node

/**
 * Version Synchronization Script
 * 
 * This script synchronizes package versions across the Old Fashioned monorepo.
 * It ensures that the VS Code extension, Stylelint plugin, and shared library
 * all maintain the same version number for consistent releases.
 * 
 * Usage:
 *   node tools/scripts/sync-versions.js [version]
 *   npm run version:sync [version]
 * 
 * If no version is provided, it reads the version from the root package.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Package paths relative to workspace root
const PACKAGES = [
    'package.json',                                     // Root workspace
    'packages/shared/package.json',                     // Shared utilities
    'packages/stylelint-oldfashioned-order/package.json', // Stylelint plugin
    'packages/vscode-old-fashioned/package.json'        // VS Code extension
];

/**
 * Read and parse a package.json file
 * @param {string} packagePath - Relative path to package.json
 * @returns {Object} Parsed package.json content
 */
function readPackageJson(packagePath) {
    const fullPath = path.resolve(__dirname, '../../', packagePath);
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        return { path: fullPath, data: JSON.parse(content) };
    } catch (error) {
        console.error(`❌ Failed to read ${packagePath}:`, error.message);
        process.exit(1);
    }
}

/**
 * Write package.json file with updated version
 * @param {string} fullPath - Absolute path to package.json
 * @param {Object} packageData - Package.json content
 * @param {string} newVersion - New version to set
 */
function writePackageJson(fullPath, packageData, newVersion) {
    try {
        packageData.version = newVersion;
        fs.writeFileSync(fullPath, JSON.stringify(packageData, null, 2) + '\n');

        const relativePath = path.relative(path.resolve(__dirname, '../../'), fullPath);
        console.log(`✅ Updated ${relativePath} to version ${newVersion}`);
    } catch (error) {
        console.error(`❌ Failed to write ${fullPath}:`, error.message);
        process.exit(1);
    }
}

/**
 * Validate semantic version format
 * @param {string} version - Version string to validate
 * @returns {boolean} True if valid semantic version
 */
function isValidVersion(version) {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*|[0-9a-zA-Z-]*[a-zA-Z-][0-9a-zA-Z-]*))*|x|X))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semverRegex.test(version);
}

/**
 * Main synchronization logic
 * @param {string} newVersion - Target version to sync to
 */
function syncVersions(newVersion) {
    console.log(`🔄 Synchronizing all packages to version ${newVersion}...\n`);

    // Validate version format
    if (!isValidVersion(newVersion)) {
        console.error(`❌ Invalid version format: ${newVersion}`);
        console.error('Expected semantic version format: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]');
        process.exit(1);
    }

    // Read all package.json files
    const packages = PACKAGES.map(readPackageJson);

    // Show current versions before sync
    console.log('📋 Current versions:');
    packages.forEach(pkg => {
        const relativePath = path.relative(path.resolve(__dirname, '../../'), pkg.path);
        console.log(`   ${relativePath}: ${pkg.data.version || 'undefined'}`);
    });
    console.log('');

    // Update all packages
    packages.forEach(pkg => {
        writePackageJson(pkg.path, pkg.data, newVersion);
    });

    console.log(`\n🎉 Successfully synchronized all packages to version ${newVersion}`);
}

/**
 * Get current version from root package.json
 * @returns {string} Current version
 */
function getCurrentVersion() {
    const rootPackage = readPackageJson('package.json');
    return rootPackage.data.version;
}

// CLI execution
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
    const args = process.argv.slice(2);
    let targetVersion;

    if (args.length === 0) {
        // No version provided, use current root version
        targetVersion = getCurrentVersion();
        console.log(`📝 No version specified, using current root version: ${targetVersion}`);
    } else if (args.length === 1) {
        // Version provided as argument
        targetVersion = args[0];
    } else {
        console.error('❌ Usage: node sync-versions.js [version]');
        process.exit(1);
    }

    syncVersions(targetVersion);
}

// Export for use as module
export { syncVersions, getCurrentVersion };