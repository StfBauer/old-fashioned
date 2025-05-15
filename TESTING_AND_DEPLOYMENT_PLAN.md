# Local Testing and Deployment Plan

This document outlines the steps for locally testing the packages within this monorepo and the process for deploying new versions.

## 1. Local Testing

Thorough local testing is crucial before any release. This involves building, testing, and (for the VS Code extension) linking the packages.

### 1.1. Building Packages

All packages can be built using Nx commands.

*   **Build all projects:**
    ```bash
    nx run-many --target=build --all
    # or using the root package.json script
    npm run build:all
    ```
*   **Build `shared` library:**
    ```bash
    nx build shared
    ```
*   **Build `stylelint-oldfashioned-order` (Stylelint plugin):**
    ```bash
    nx build stylelint-oldfashioned-order
    ```
    This also triggers the `bundle-shared` target to include necessary code from the `shared` library into the `dist` output of `stylelint-oldfashioned-order`.
*   **Build `vscode-old-fashioned` (VS Code extension):**
    ```bash
    nx build vscode-old-fashioned
    ```

### 1.2. Running Unit Tests

Unit tests are implemented using Vitest.

*   **Run all tests:**
    ```bash
    nx run-many --target=test --all
    # or
    npm test
    ```
*   **Run tests for `shared` library:**
    ```bash
    nx test shared
    ```
*   **Run tests for `stylelint-oldfashioned-order`:**
    ```bash
    nx test stylelint-oldfashioned-order
    ```
*   **Run tests for `vscode-old-fashioned`:**
    ```bash
    nx test vscode-old-fashioned
    ```
    This target depends on `copy-test-samples` to ensure necessary test fixture files are in place.

### 1.3. Testing `stylelint-oldfashioned-order` Locally

1.  **Build the plugin:**
    ```bash
    nx build stylelint-oldfashioned-order
    ```
2.  **Link the plugin:**
    Navigate to the `dist/packages/stylelint-oldfashioned-order` directory and run `npm link`.
    ```bash
    cd dist/packages/stylelint-oldfashioned-order
    npm link
    cd ../../.. # Navigate back to workspace root
    ```
3.  **Use in a test project:**
    In a separate project where you want to test the Stylelint plugin:
    *   Run `npm link stylelint-oldfashioned-order`.
    *   Configure your Stylelint setup to use `stylelint-oldfashioned-order`.
    *   Run Stylelint on your CSS files.

### 1.4. Testing `vscode-old-fashioned` Locally

The VS Code extension can be tested by sideloading it into VS Code.

1.  **Build the extension:**
    ```bash
    nx build vscode-old-fashioned
    ```
2.  **Package the extension (creates a `.vsix` file):**
    ```bash
    nx package vscode-old-fashioned
    ```
    The `.vsix` file will be located in `dist/packages/vscode-old-fashioned/`.
3.  **Install the `.vsix` file in VS Code:**
    *   Open VS Code.
    *   Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X).
    *   Click the "..." menu at the top of the Extensions view.
    *   Select "Install from VSIX..." and choose the generated `.vsix` file.
4.  **Alternative: Using the `link-dev` target for rapid development:**
    The `link-dev` target automates building, packaging, and installing the extension for local development.
    ```bash
    nx link-dev vscode-old-fashioned
    ```
    This will:
    *   Build the extension.
    *   Determine the current version from `packages/vscode-old-fashioned/package.json`.
    *   Package the extension into a `.vsix` file.
    *   Uninstall any existing version of `n8design.old-fashioned-stylelint-order`.
    *   Install the newly packaged `.vsix` file using `code --install-extension`.
    *   You may need to reload VS Code for the changes to take effect.

## 2. Deployment (Release Process)

Deployment is automated using `nx release` for versioning, changelog generation, Git tagging, and publishing.

### 2.1. Overview

The `nx release` command orchestrates the release process for the specified projects. It handles:
*   Determining the next version based on conventional commits.
*   Updating `package.json` files with the new version.
*   Generating/updating changelogs.
*   Committing and tagging the release in Git.
*   Publishing packages to their respective registries (npm for `stylelint-oldfashioned-order`, VS Code Marketplace for `vscode-old-fashioned`).

### 2.2. Triggering a Release

Ensure your working directory is clean and all changes are pushed to the remote repository.

To start the release process:
```bash
npm run release
# or directly
npx nx release --verbose
```
This will trigger the `release` configuration defined in `nx.json`, which includes two release groups:
*   `npmPackages`: Handles `stylelint-oldfashioned-order`.
*   `vscodeExtensions`: Handles `vscode-old-fashioned`.

The process will prompt for version confirmation and then proceed with the steps.

### 2.3. What Happens During Release

*   **Versioning & Changelogs**: `nx release version` updates versions and changelogs.
*   **Git Operations**: Changes are committed, and a Git tag is created.
*   **Publishing**:
    *   For `stylelint-oldfashioned-order`:
        *   The `nx-release-publish` target in its `project.json` is invoked.
        *   This runs `nx run stylelint-oldfashioned-order:npm-publish`.
        *   The `npm-publish` target depends on `bundle-shared` (to ensure the shared code is bundled) and then runs `npm publish ./packages/stylelint-oldfashioned-order/dist --access=public`.
    *   For `vscode-old-fashioned`:
        *   The `nx-release-publish` target in its `project.json` is invoked.
        *   This runs `nx run vscode-old-fashioned:vsce-publish`.
        *   The `vsce-publish` target depends on `package` (to build the `.vsix` file) and then runs `vsce publish --packagePath ./dist/packages/vscode-old-fashioned/*.vsix`. (Requires `VSCE_PAT` environment variable for the Personal Access Token).

### 2.4. Required Environment Variables for Publishing

*   **For `stylelint-oldfashioned-order` (npm):**
    *   `NPM_TOKEN`: Your npm access token with publish permissions. This is typically configured in your `~/.npmrc` or CI environment.
*   **For `vscode-old-fashioned` (VS Code Marketplace):**
    *   `VSCE_PAT`: Your Visual Studio Code Marketplace Personal Access Token.

## 3. Verification Post-Deployment

After the release process completes:

1.  **Verify `stylelint-oldfashioned-order` on npm:**
    *   Check the npm registry for the new version: `https://www.npmjs.com/package/stylelint-oldfashioned-order`
    *   Try installing the new version in a test project.
2.  **Verify `vscode-old-fashioned` on VS Code Marketplace:**
    *   Check the VS Code Marketplace for the new version: `https://marketplace.visualstudio.com/items?itemName=n8design.old-fashioned-stylelint-order`
    *   Try installing or updating the extension from within VS Code.
3.  **Check Git Tags:**
    *   Ensure new tags have been pushed to the remote repository (e.g., `git ls-remote --tags origin`).

This plan should provide a solid foundation for testing and releasing the project.
