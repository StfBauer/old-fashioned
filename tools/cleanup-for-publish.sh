#!/bin/bash

echo "Starting cleanup for publishing VS Code extension..."

# Create documentation directory structure if it doesn't exist
mkdir -p .documentation/test-cleanup

# Create main README if it doesn't exist
if [ ! -f .documentation/README.md ]; then
  cat > .documentation/README.md << 'EOF'
# Old Fashioned - Internal Documentation

This directory contains internal documentation for the Old-Fashioned project that's useful for developers but shouldn't be part of the public documentation.

## Contents

- `test-cleanup/` - Documentation related to the test cleanup effort for the VS Code extension
EOF
fi

# Create test-cleanup README if it doesn't exist
if [ ! -f .documentation/test-cleanup/README.md ]; then
  cat > .documentation/test-cleanup/README.md << 'EOF'
# Test Cleanup Documentation

This directory contains documentation related to the test cleanup effort for the Old-Fashioned VS Code extension.

## Documents
- Test plans, summaries, and results for internal reference
EOF
fi

# Find and move all test documentation files
echo "Moving test documentation files..."
find ./packages/vscode-old-fashioned -type f -name "TEST-*.md" -exec mv {} .documentation/test-cleanup/ \;

# Update .gitignore to exclude .documentation directory
if ! grep -q "^.documentation/" .gitignore; then
  echo "" >> .gitignore
  echo "# Internal documentation" >> .gitignore
  echo ".documentation/" >> .gitignore
  echo "Added .documentation/ to .gitignore"
fi

# Enhanced cleanup for VS Code extension publishing
echo "Starting VS Code extension publishing preparation..."

# Check for package.json and ensure it's properly configured
if [ -f "./packages/vscode-old-fashioned/package.json" ]; then
  echo "Verifying package.json configuration..."
  # Ensure engines field exists
  if ! grep -q '"engines":' "./packages/vscode-old-fashioned/package.json"; then
    echo "⚠️ Warning: No 'engines' field found in package.json. VS Code extensions require this."
  fi
  
  # Check if publisher is set
  if ! grep -q '"publisher":' "./packages/vscode-old-fashioned/package.json"; then
    echo "⚠️ Warning: No 'publisher' field found in package.json. Required for publishing."
  fi
  
  # Check for contributes section
  if ! grep -q '"contributes":' "./packages/vscode-old-fashioned/package.json"; then
    echo "⚠️ Warning: No 'contributes' section found in package.json. Extensions typically need this."
  fi
fi

# Check for README.md
if [ ! -f "./packages/vscode-old-fashioned/README.md" ]; then
  echo "⚠️ Warning: No README.md found. Required for marketplace listing."
else
  echo "✅ README.md found."
fi

# Check for CHANGELOG.md
if [ ! -f "./packages/vscode-old-fashioned/CHANGELOG.md" ]; then
  echo "⚠️ Warning: No CHANGELOG.md found. Recommended for marketplace listing."
else
  echo "✅ CHANGELOG.md found."
fi

# Find and clean up console.log statements
echo "Identifying console.log statements that should be removed..."
grep -r "console.log" ./packages/vscode-old-fashioned/src --include="*.ts"

# Find TODO comments for review
echo "Finding TODOs for review..."
grep -r "TODO" ./packages/vscode-old-fashioned/src --include="*.ts"

echo "Cleanup script complete. Please review the identified items."
echo "Next steps:"
echo "1. Address any warnings reported above"
echo "2. Run 'npm run package' to create the VSIX file"
echo "3. Test the VSIX by installing it directly in VS Code"
echo "4. When ready, publish with 'npm run publish'"
