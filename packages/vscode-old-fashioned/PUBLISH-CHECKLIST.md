# VS Code Extension Publish Checklist

Before publishing the Old Fashioned extension to the VS Code Marketplace, ensure you've completed the following checks:

## Package.json
- [ ] Version number updated (keeping at 0.0.1 for now)
- [ ] Display name and description are correct
- [ ] Categories and keywords are appropriate
- [ ] Repository, bugs, and homepage URLs are valid
- [ ] License is correct
- [ ] Publisher name is set correctly

## Documentation
- [ ] README.md has clear installation and usage instructions
- [ ] CHANGELOG.md is updated with latest changes
- [ ] Screenshots are current and clear

## Code Quality
- [ ] All tests are passing
- [ ] No debug console.log statements remain
- [ ] No TODO comments for critical features
- [ ] All TypeScript errors are resolved

## Extension Assets
- [ ] Icon is properly sized (128x128 pixels minimum)
- [ ] All images used in the extension are optimized

## Features
- [ ] All advertised features are working
- [ ] Commands are properly registered
- [ ] Extension activation works as expected
- [ ] Settings are properly documented

## VS Code-Specific Requirements
- [ ] Ensure extension activates in appropriate conditions (onLanguage, etc.)
- [ ] Check package.json contributes section is properly configured
- [ ] Extension satisfies [VS Code publishing requirements](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)

## Cleanup Tasks
- [ ] Move test documentation to .documentation folder
- [ ] Remove any temporary or debug files
- [ ] Ensure all dependencies are properly listed in package.json
- [ ] Check bundling configuration (webpack/esbuild) to exclude unnecessary files

## Publishing Steps
1. Update version in package.json
2. Run `npm run package` to create the VSIX file
3. Test the VSIX by installing it directly in VS Code
4. Run `npm run publish` to publish to the marketplace

After publishing:
- [ ] Verify the extension is available on the marketplace
- [ ] Ensure installation works from the marketplace
- [ ] Tag the release in the repository
