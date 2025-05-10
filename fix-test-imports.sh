#!/bin/bash
# Script to fix import paths in test files

# Base directory
BASE_DIR="/Volumes/Code/n8design/projects/old-fashioned/packages/shared"

# Function to update imports in a file
update_imports() {
    local file=$1
    
    echo "Updating imports in: $file"
    
    # Calculate relative path to src folder
    local rel_path="../"
    local depth=$(echo "$file" | tr -cd '/' | wc -c)
    # The depth of BASE_DIR/test/ is 2, so we need to add more "../" based on additional depth
    local additional_depth=$((depth - 2))
    
    for ((i=0; i<additional_depth; i++)); do
        rel_path="../$rel_path"
    done
    
    # Update imports with sed
    sed -i '' "s|from '../src/|from '$rel_path../src/|g" "$file"
    
    # Check for success
    if [ $? -eq 0 ]; then
        echo "  Successfully updated imports in $file"
    else
        echo "  Failed to update imports in $file"
    fi
}

# Process all test files
find "$BASE_DIR/test" -type f -name "*.ts" | while read -r file; do
    # Skip files that have already been fixed
    if grep -q "from '../../src/" "$file"; then
        echo "Skipping already fixed file: $file"
    else
        update_imports "$file"
    fi
done

echo "Import path updates completed!"
