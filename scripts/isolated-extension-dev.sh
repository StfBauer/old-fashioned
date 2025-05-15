#!/bin/bash

# Script to set up and launch VS Code with a dedicated extension development profile
# This provides a clean environment for extension testing

PROFILE_NAME="extension-dev"
WORKSPACE_PATH=${1:-"/Volumes/Code/n8design/projects/old-fashioned"}
EXTENSIONS_DIR="/Volumes/Code/n8design/projects/extension-dev-data/extensions"
USER_DATA_DIR="/Volumes/Code/n8design/projects/extension-dev-data/user-data"

# Create directories if they don't exist
mkdir -p "$EXTENSIONS_DIR" "$USER_DATA_DIR"

# Launch VS Code with a completely isolated environment
# This prevents any other extensions from interfering with your development
code \
  --profile "$PROFILE_NAME" \
  --extensions-dir "$EXTENSIONS_DIR" \
  --user-data-dir "$USER_DATA_DIR" \
  "$WORKSPACE_PATH"

echo "VS Code launched with isolated profile: $PROFILE_NAME"
echo "Extensions dir: $EXTENSIONS_DIR"
echo "User data dir: $USER_DATA_DIR"
echo "Workspace: $WORKSPACE_PATH"
