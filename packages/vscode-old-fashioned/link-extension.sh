#!/bin/bash

# Get the directory of the extension
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
EXTENSION_DIR="$SCRIPT_DIR"

# VS Code extensions directory
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    VSCODE_EXTENSIONS="$HOME/.vscode/extensions"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    VSCODE_EXTENSIONS="$HOME/.vscode/extensions"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows with Git Bash or similar
    VSCODE_EXTENSIONS="$APPDATA/Code/User/extensions"
fi

# Create target directory name
EXTENSION_TARGET="$VSCODE_EXTENSIONS/n8design.vscode-old-fashioned-0.0.1"

# Remove existing symlink if it exists
if [ -e "$EXTENSION_TARGET" ]; then
    echo "Removing existing extension..."
    rm -rf "$EXTENSION_TARGET"
fi

# Create the symlink
echo "Creating symlink from $EXTENSION_DIR to $EXTENSION_TARGET"
ln -s "$EXTENSION_DIR" "$EXTENSION_TARGET"

echo "Extension linked successfully. Restart VS Code to see the extension."
