#!/bin/bash
# This script completes the test cleanup process for the Old Fashioned extension

# Set the base directory
BASE_DIR="/Volumes/Code/n8design/projects/old-fashioned/packages/vscode-old-fashioned"
TESTS_DIR="$BASE_DIR/src/tests"

echo "Starting test cleanup process..."

# 1. First verify the files are accessible
if [ ! -f "$TESTS_DIR/extension.test.ts" ]; then
  echo "Error: extension.test.ts not found, aborting."
  exit 1
fi

if [ ! -f "$TESTS_DIR/config-integration.test.ts" ]; then
  echo "Error: config-integration.test.ts not found, aborting."
  exit 1
fi

# 2. Make backup files
echo "Creating backups of original files..."
cp "$TESTS_DIR/extension.test.ts" "$TESTS_DIR/extension.test.backup.ts"
cp "$TESTS_DIR/config-integration.test.ts" "$TESTS_DIR/config-integration.test.backup.ts"

# 3. Set execution bit on test-helper.sh
chmod +x "$BASE_DIR/test-helper.sh"

# 4. Remove duplicate test files that are no longer needed
echo "Cleaning up redundant test files..."

# Only remove if consolidated versions exist
if [ -f "$TESTS_DIR/extension.test.ts" ] && [ -f "$TESTS_DIR/extension.consolidated.test.ts" ]; then
  rm "$TESTS_DIR/extension-updated.test.ts" 2>/dev/null || true
fi

if [ -f "$TESTS_DIR/config-integration.test.ts" ] && [ -f "$TESTS_DIR/config-integration.consolidated.test.ts" ]; then
  rm "$TESTS_DIR/config-integration-updated.test.ts" 2>/dev/null || true
fi

# 5. Run the test suite to verify
echo "Running tests to verify fixes..."
cd "$BASE_DIR" && npx vitest run src/tests/extension.test.ts src/tests/config-integration.test.ts

echo "Test cleanup complete."
