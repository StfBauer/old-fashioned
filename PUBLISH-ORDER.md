# Publication Order for Old Fashioned Packages

For correct dependency resolution, packages should be published in the following order:

## 1. Publish @old-fashioned/shared
```bash
cd packages/shared
npm version 0.0.1 # Set appropriate version
npm publish
```

## 2. Publish stylelint-oldfashioned-order
```bash
cd packages/stylelint-oldfashioned-order
# Update package.json to use published @old-fashioned/shared
npm version 0.0.1 # Set appropriate version
npm publish
```

## 3. Update VS Code extension dependencies
Edit `packages/vscode-old-fashioned/package.json` to use the published packages:
```json
"dependencies": {
  "@old-fashioned/shared": "^0.0.1", // Use published version instead of file:../shared
  // ...other dependencies...
  "stylelint-oldfashioned-order": "^0.0.1", // Use published version instead of file:../stylelint-oldfashioned-order
  // ...other dependencies...
}
```

## 4. Publish VS Code extension
```bash
cd packages/vscode-old-fashioned
npm run package
# Test VSIX
npm run publish
```
