# Changelog

All notable changes to the stylelint-oldfashioned-order package will be documented in this file.

## 0.0.1 (Initial Release)

### Features

- Initial release with support for multiple sorting strategies:
  - Alphabetical sorting
  - Concentric sorting
  - Idiomatic sorting
- Special handling for vendor prefixes
- Support for CSS variables and SCSS variables

### Testing Notes

To properly test the production build:

1. **Go to the workspace root directory first**:
   ```bash
   cd /Volumes/Code/n8design/projects/old-fashioned
   ```

2. **Build the package**:
   ```bash
   nx build stylelint-oldfashioned-order
   ```

3. **Create a test directory at the workspace root**:
   ```bash
   mkdir -p test-stylelint
   cd test-stylelint
   npm init -y
   ```

4. **Install the locally built package using the absolute path**:
   ```bash
   npm install --save-dev /Volumes/Code/n8design/projects/old-fashioned/dist/packages/stylelint-oldfashioned-order
   ```

5. **Set up test configuration**:
   ```bash
   echo "module.exports = { plugins: ['stylelint-oldfashioned-order'], rules: { 'oldfashioned-order/properties-order': 'alphabetical' } };" > .stylelintrc.js
   echo ".test { color: red; background: white; }" > test.css
   ```

6. **Run stylelint**:
   ```bash
   npx stylelint test.css --fix
   ```

**IMPORTANT**: For your current situation, since you're in a deeply nested directory, the quickest solution is to use the absolute path to the package:

```bash
npm install --save-dev /Volumes/Code/n8design/projects/old-fashioned/dist/packages/stylelint-oldfashioned-order
```

Or navigate back to the workspace root first:

```bash
cd /Volumes/Code/n8design/projects/old-fashioned
mkdir -p test-stylelint
cd test-stylelint
npm init -y
npm install --save-dev ../dist/packages/stylelint-oldfashioned-order
```
