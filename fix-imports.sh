#!/bin/bash
# Enhanced script to fix import paths in test files

# Base directory
BASE_DIR="/Volumes/Code/n8design/projects/old-fashioned/packages/shared"

# Function to update imports in a file
fix_imports() {
    local file=$1
    echo "Fixing imports in: $file"
    
    # Calculate relative path to src folder
    local depth=$(echo "$file" | tr -cd '/' | wc -c)
    local rel_path=""
    
    # Calculate the proper relative path based on directory depth
    for ((i=0; i<depth-2; i++)); do
        rel_path="../$rel_path"
    done
    
    # Update imports with sed
    sed -i '' "s|from '../src/|from '$rel_path../src/|g" "$file"
    
    echo "  ✓ Updated imports in $file"
}

# Process all test files in subdirectories
find "$BASE_DIR/test" -type f -name "*.ts" | while read -r file; do
    # Skip files in root test directory
    if [[ $(dirname "$file") != "$BASE_DIR/test" ]]; then
        fix_imports "$file"
    fi
done

echo "Import paths updated!"
