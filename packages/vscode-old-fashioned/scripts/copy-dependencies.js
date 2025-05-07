const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Make sure required directories exist in the dist folder
const distModulesDir = path.join(__dirname, '../dist/node_modules');
if (!fs.existsSync(distModulesDir)) {
    fs.mkdirSync(distModulesDir, { recursive: true });
}

// Run npm list to find all dependency paths
try {
    console.log('Copying required dependencies to dist folder...');

    // Copy essential stylelint packages to dist
    const packagesToCopy = ['stylelint', 'stylelint-order', 'postcss-scss', 'stylelint-scss', 'postcss'];

    for (const pkg of packagesToCopy) {
        const srcDir = path.join(__dirname, '../node_modules', pkg);
        const destDir = path.join(distModulesDir, pkg);

        if (fs.existsSync(srcDir)) {
            // Remove destination if it exists
            if (fs.existsSync(destDir)) {
                if (process.platform === 'win32') {
                    execSync(`rmdir /s /q "${destDir}"`);
                } else {
                    execSync(`rm -rf "${destDir}"`);
                }
            }

            // Create destination directory
            fs.mkdirSync(path.dirname(destDir), { recursive: true });

            // Copy directory
            if (process.platform === 'win32') {
                execSync(`xcopy "${srcDir}" "${destDir}" /E /I /Y`);
            } else {
                execSync(`cp -R "${srcDir}" "${destDir}"`);
            }

            console.log(`Copied ${pkg} to dist/node_modules`);
        } else {
            console.warn(`Package ${pkg} not found in node_modules`);
        }
    }

    console.log('Dependencies copied successfully!');
} catch (error) {
    console.error('Error copying dependencies:', error);
    process.exit(1);
}
