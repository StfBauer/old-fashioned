#!/bin/bash

# Old-Fashioned Publish Preparation Script
# This script prepares packages for publishing by cleaning up unnecessary files

echo "======================================"
echo "  Old-Fashioned Publish Preparation"
echo "======================================"
echo "This script prepares packages for publishing"

# Packages to prepare
PACKAGES=(
  "packages/shared"
  "packages/stylelint-oldfashioned-order"
  "packages/vscode-old-fashioned"
)

# Clean each package
for PACKAGE in "${PACKAGES[@]}"; do
  echo "Preparing $PACKAGE..."
  
  # Check if package directory exists
  if [ -d "$PACKAGE" ]; then
    # Remove TypeScript build info files
    find "$PACKAGE" -name "*.tsbuildinfo" -type f -delete
    
    # Remove source map files that might have been generated
    find "$PACKAGE" -name "*.map" -type f -delete
    
    # Clean up test artifacts if any
    find "$PACKAGE" -path "$PACKAGE/test/*" -name "*.js" -type f -delete
    
    # Delete any local node_modules (should be using workspace dependencies)
    if [ -d "$PACKAGE/node_modules" ]; then
      echo "Removing local node_modules in $PACKAGE"
      rm -rf "$PACKAGE/node_modules"
    fi
    
    # Special handling for vscode extension
    if [ "$PACKAGE" == "packages/vscode-old-fashioned" ]; then
      # For VSCode extension, ensure we only have necessary files
      if [ -f "$PACKAGE/*.vsix" ]; then
        echo "Removing old VSIX packages"
        rm -f "$PACKAGE"/*.vsix
      fi
    fi
    
    echo "$PACKAGE prepared successfully!"
  else
    echo "Package directory $PACKAGE not found, skipping"
  fi
done

# Final verification
echo "Verifying package content..."
for PACKAGE in "${PACKAGES[@]}"; do
  if [ -d "$PACKAGE/dist" ]; then
    DIST_FILES=$(find "$PACKAGE/dist" -type f | wc -l | tr -d ' ')
    echo "$PACKAGE/dist contains $DIST_FILES files"
    
    if [ "$DIST_FILES" -eq 0 ]; then
      echo "⚠️  Warning: $PACKAGE/dist is empty! You need to build before publishing."
    fi
  else
    echo "⚠️  Warning: $PACKAGE/dist not found! You need to build before publishing."
  fi
done

echo "✨ Publish preparation complete! ✨"
echo "--------------------------------------"
echo "You can now publish your packages"
