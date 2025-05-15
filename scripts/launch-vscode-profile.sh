#!/bin/bash

# Script to launch VS Code with a specific profile
# Usage: ./launch-vscode-profile.sh [profile-name]

PROFILE_NAME=${1:-"dev-profile"} # Default profile name if not provided

# Create the directory for the profile if needed
mkdir -p ~/.vscode/profiles/$PROFILE_NAME

# Open VS Code with the specified profile
# You can modify this to open a specific folder
code --profile "$PROFILE_NAME" "$2"

echo "VS Code launched with profile: $PROFILE_NAME"
