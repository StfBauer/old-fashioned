# Revised Publication Strategy

## Bundle shared code without moving source files

This approach preserves your existing code structure while creating a bundled package for publication:

1. Keep source files in their current locations
2. Modify the build process to include shared code in the stylelint plugin package

### Implementation steps:

1. Update the stylelint-oldfashioned-order build configuration:

```json
// filepath: /Volumes/Code/n8design/projects/old-fashioned/packages/stylelint-oldfashioned-order/tsconfig.json
{
  // ...existing code...
  "compilerOptions": {
    // ...existing code...
    "paths": {
      "@old-fashioned/shared": ["../shared/src/index.ts"]
    }
  },
  // ...existing code...
}
```

2. Create a bundled build script:

```javascript
// filepath: /Volumes/Code/n8design/projects/old-fashioned/packages/stylelint-oldfashioned-order/scripts/build-for-publish.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Build both packages
console.log('Building shared package...');
execSync('nx build shared', { stdio: 'inherit' });

console.log('Building stylelint-oldfashioned-order...');
execSync('nx build stylelint-oldfashioned-order', { stdio: 'inherit' });

// Create a modified package.json for publication
const packageJson = require('../package.json');

// Remove the file: reference to shared
if (packageJson.dependencies && packageJson.dependencies['@old-fashioned/shared']) {
  delete packageJson.dependencies['@old-fashioned/shared'];
}

// Copy built files from shared into the stylelint package dist
console.log('Bundling shared library...');
const sharedDistDir = path.resolve(__dirname, '../../shared/dist');
const pluginDistDir = path.resolve(__dirname, '../dist');
const pluginLibDir = path.resolve(pluginDistDir, 'lib');

// Create lib directory if it doesn't exist
if (!fs.existsSync(pluginLibDir)) {
  fs.mkdirSync(pluginLibDir, { recursive: true });
}

// Copy shared distribution files to the plugin's lib directory
fs.readdirSync(sharedDistDir).forEach(file => {
  if (file.endsWith('.js') || file.endsWith('.d.ts')) {
    fs.copyFileSync(
      path.join(sharedDistDir, file),
      path.join(pluginLibDir, file)
    );
  }
});

// Update imports in the plugin's code to use the bundled version
console.log('Updating imports...');
const distFiles = getAllFiles(pluginDistDir, ['.js']);
distFiles.forEach(file => {
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

// Write the modified package.json for publishing
fs.writeFileSync(
  path.join(pluginDistDir, 'package.json'),
  JSON.stringify(packageJson, null, 2)
);

// Copy README and license
fs.copyFileSync(
  path.resolve(__dirname, '../README.md'),
  path.join(pluginDistDir, 'README.md')
);

console.log('Build completed! Ready for publishing from the dist directory.');

function getAllFiles(dir, extensions = []) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(filePath, extensions));
    } else {
      if (extensions.length === 0 || extensions.some(ext => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  return results;
}
```

3. Add the script to package.json:

```json
// filepath: /Volumes/Code/n8design/projects/old-fashioned/packages/stylelint-oldfashioned-order/package.json
{
  // ...existing code...
  "scripts": {
    // ...existing code...
    "build:publish": "node scripts/build-for-publish.js",
    "publish:bundle": "cd dist && npm publish"
  },
  // ...existing code...
}
```

## Publishing Steps

1. Bundle and publish stylelint-oldfashioned-order:
   ```bash
   cd packages/stylelint-oldfashioned-order
   npm version 0.0.1
   npm run build:publish
   npm run publish:bundle
   ```

2. Update VS Code extension package.json:
   ```json
   "dependencies": {
     "stylelint-oldfashioned-order": "^0.0.1",
     // Remove @old-fashioned/shared dependency
     // Keep other dependencies
   }
   ```

3. Package and publish the VS Code extension:
   ```bash
   cd packages/vscode-old-fashioned
   npm run package
   # Test VSIX
   npm run publish
   ```

This approach gives you the best of both worlds - maintaining code separation during development while publishing a single bundled package.
