#!/bin/bash

# Create documentation directory structure
mkdir -p .documentation/test-cleanup

# Create main README
cat > .documentation/README.md << 'EOF'
# Old Fashioned - Internal Documentation

This directory contains internal documentation for the Old-Fashioned project that's useful for developers but shouldn't be part of the public documentation.

## Contents

- `test-cleanup/` - Documentation related to the test cleanup effort for the VS Code extension
EOF

# Create test-cleanup README
cat > .documentation/test-cleanup/README.md << 'EOF'
# Test Cleanup Documentation

This directory contains documentation related to the test cleanup effort for the Old-Fashioned VS Code extension.

## Documents

### Planning Phase
- [Test Cleanup Plan](./TEST-CLEANUP-PLAN.md) - Initial plan outlining the test cleanup strategy

### Progress Reports
- [Test Fix Summary - Initial](./TEST-FIX-SUMMARY.md) - First report identifying core problems
- [Test Fix Summary - Updated](./TEST-FIX-SUMMARY-UPDATED.md) - Progress update on fixes
- [Test Fix Summary - Final](./TEST-FIX-SUMMARY-FINAL.md) - Comprehensive report on all fixes applied

### Results
- [Test Cleanup Results](./TEST-CLEANUP-RESULTS.md) - Summary of cleanup results
- [Test Cleanup Final Report](./TEST-CLEANUP-FINAL-REPORT.md) - Final documentation of the entire effort

## Usage

These documents provide valuable context for:
- Understanding the test suite architecture
- Recognizing patterns to avoid in future test development
- Learning about the proper way to mock VS Code APIs in Vitest
- Tracking the evolution of the test cleanup effort
EOF

# Find and move all test documentation files
find . -type f -name "TEST-*.md" -exec mv {} .documentation/test-cleanup/ \;

echo "Documentation collection complete. Files moved to .documentation/test-cleanup/"
