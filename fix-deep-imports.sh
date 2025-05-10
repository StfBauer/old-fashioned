#!/bin/bash

# Base directory
BASE_DIR="/Volumes/Code/n8design/projects/old-fashioned/packages/shared"

# Process files in problematic directories
process_directory() {
    local dir="$BASE_DIR/test/$1"
    if [ -d "$dir" ]; then
        echo "Processing directory: $dir"
        find "$dir" -type f -name "*.ts" | while read -r file; do
            echo "Fixing extremely nested paths in: $file"
            
            # Replace paths like ../../../../../../../../../src/ with ../../src/
            sed -i '' "s|from '../../../../../../../../../src/|from '../../src/|g" "$file"
            
            # Replace paths like ../../../../../../../src/ with ../../src/
            sed -i '' "s|from '../../../../../../../src/|from '../../src/|g" "$file"
            
            # Replace paths like ../../../../../src/ with ../../src/
            sed -i '' "s|from '../../../../../src/|from '../../src/|g" "$file"
            
            # Replace paths like ../../../src/ with ../../src/
            sed -i '' "s|from '../../../src/|from '../../src/|g" "$file"
            
            echo "  ✓ Fixed paths in $file"
        done
    else
        echo "Directory does not exist: $dir"
    fi
}

# Fix deeply nested directories
process_directory "core"
process_directory "css-variables"
process_directory "edge-cases"
process_directory "integration"

echo "Import paths fixed in deeply nested directories!"
