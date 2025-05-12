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

# Launch VS Code with the extension
echo "🚀 Launching VS Code with the extension in development mode..."
code --extensionDevelopmentPath="$EXTENSION_DIR" "$@"

echo "✅ VS Code launched with the extension loaded in development mode."
