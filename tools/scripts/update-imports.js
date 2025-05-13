const fs = require('fs');
const path = require('path');

// Find all JavaScript files in the dist directory
function getAllFiles(dir, fileList = [], extensions = ['.js']) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            fileList = getAllFiles(filePath, fileList, extensions);
        } else if (extensions.includes(path.extname(file))) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Update imports in the files
function updateImports() {
    const pluginDistDir = path.resolve(__dirname, '../../dist/packages/stylelint-oldfashioned-order');
    const jsFiles = getAllFiles(pluginDistDir);

    console.log(`Updating imports in ${jsFiles.length} files...`);

    jsFiles.forEach(file => {
        let content = fs.readFileSync(file, 'utf8');

        // Replace imports from @old-fashioned/shared to ./lib
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

    console.log('Imports updated successfully.');
}

updateImports();
