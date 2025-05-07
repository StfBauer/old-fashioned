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

echo "Setup complete!"
