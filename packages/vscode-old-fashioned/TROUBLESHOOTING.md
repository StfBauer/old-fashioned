# Troubleshooting

## Stale TypeScript Problems

If you see errors in the VS Code problems panel that refer to files that no longer exist or issues that you've already fixed, you may need to clear the TypeScript build cache:

```bash
# Navigate to the extension directory
cd /Volumes/Code/n8design/projects/old-fashioned/packages/vscode-old-fashioned

# Clear the build cache and rebuild
npm run clean
npm run build
```

You may also need to:
1. Restart the TypeScript language server by running the "TypeScript: Restart TS Server" command in VS Code
2. Or restart VS Code entirely

## Module Resolution Issues

If you encounter "Cannot find module" or similar errors related to the shared package, make sure:

1. All packages have been built: 
   ```bash
   cd /Volumes/Code/n8design/projects/old-fashioned
   npm run build
   ```

2. Dependencies are correctly defined in package.json

3. TypeScript paths are correctly configured in tsconfig.json
