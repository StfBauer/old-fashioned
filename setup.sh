#!/bin/bash

# Install dependencies
npm install

# Build packages in the correct order
echo "Building shared package..."
cd packages/shared
npm run build
cd ../..

echo "Building stylelint plugin..."
cd packages/stylelint-oldschool-order
npm run build
cd ../..

echo "Building VS Code extension..."
cd packages/vscode-old-fashioned
npm run build
cd ../..

# Prelaunch script to copy test samples to a temp folder
TEMP_DIR="packages/vscode-old-fashioned/temp"
SAMPLES_DIR="packages/vscode-old-fashioned/test/samples"

# Recreate the temp folder
rm -rf "$TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Copy test samples to the temp folder
cp -r "$SAMPLES_DIR"/* "$TEMP_DIR"/

echo "Setup complete!"
