#!/bin/bash

# Exit on any error
set -e

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
EXTENSION_DIR="$SCRIPT_DIR/.."

# Build the extension
echo "🛠️ Building the extension..."
cd "$EXTENSION_DIR"
npm run build

# Package the extension
echo "📦 Packaging the extension..."
cd "$EXTENSION_DIR"
npx @vscode/vsce package --no-dependencies

# Find the generated VSIX file
VSIX_FILE=$(find "$EXTENSION_DIR" -maxdepth 1 -name "*.vsix" | sort -r | head -n 1)

if [ -z "$VSIX_FILE" ]; then
    echo "❌ Error: Could not find the packaged extension (.vsix file)"
    exit 1
fi

echo "📄 Found package: $(basename "$VSIX_FILE")"

# Install the extension
echo "🔌 Installing the extension in VS Code..."
code --install-extension "$VSIX_FILE" --force

echo "✅ Extension installed successfully!"
echo ""
echo "To test it, open a CSS file in VS Code and use the Command Palette (Cmd+Shift+P) to run 'Sort CSS Properties (Old Fashioned)'."
