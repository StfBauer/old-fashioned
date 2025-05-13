const fs = require('fs');
const path = require('path');

// Get the package name from command line arguments
const packageName = process.argv[2];

if (!packageName) {
    console.error('Please provide a package name');
    process.exit(1);
}

// Path to the source and dist package.json files
const sourcePackageJsonPath = path.resolve(__dirname, `../../packages/${packageName}/package.json`);
const distPackageJsonPath = path.resolve(__dirname, `../../dist/packages/${packageName}/package.json`);

// Read the source package.json
const packageJson = require(sourcePackageJsonPath);

// Modify dependencies - remove @old-fashioned/shared from dependencies
if (packageJson.dependencies && packageJson.dependencies['@old-fashioned/shared']) {
    delete packageJson.dependencies['@old-fashioned/shared'];
    console.log('Removed @old-fashioned/shared from dependencies');
}

// Write the modified package.json to the dist directory
fs.writeFileSync(
    distPackageJsonPath,
    JSON.stringify(packageJson, null, 2)
);

// Copy README.md if it exists
const readmePath = path.resolve(__dirname, `../../packages/${packageName}/README.md`);
const distReadmePath = path.resolve(__dirname, `../../dist/packages/${packageName}/README.md`);

if (fs.existsSync(readmePath)) {
    fs.copyFileSync(readmePath, distReadmePath);
    console.log('Copied README.md to dist');
}

console.log(`Package ${packageName} prepared for publishing successfully.`);
