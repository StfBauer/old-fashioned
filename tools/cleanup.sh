#!/bin/bash

# Old-Fashioned Project Cleanup Script
# This script removes temporary files and build artifacts to reduce clutter

echo "======================================"
echo "  Old-Fashioned Project Cleanup Tool"
echo "======================================"
echo "Starting cleanup process..."

# Function to format file size
format_size() {
  local size=$1
  echo "$size"
}

# Function to count and report deleted files
count_deleted() {
  local pattern=$1
  local count=$(find . -name "$pattern" -type f | wc -l | tr -d ' ')
  if [ "$count" -gt 0 ]; then
    echo "Found $count $pattern files to remove"
  else
    echo "No $pattern files found"
  fi
}

# Remove TypeScript build info files
echo "🧹 Cleaning TypeScript build info files..."
count_deleted "*.tsbuildinfo"
find . -name "*.tsbuildinfo" -type f -delete

# Remove source map files
echo "🧹 Cleaning source map files..."
count_deleted "*.map"
find . -name "*.map" -type f -delete

# Remove VS Code extension packages
echo "🧹 Cleaning VS Code extension packages..."
count_deleted "*.vsix"
find . -name "*.vsix" -type f -delete

# Clean benchmark results
echo "🧹 Checking benchmark results..."
if [ -d "./benchmark/results" ]; then
  BENCH_SIZE=$(du -sh ./benchmark/results 2>/dev/null | cut -f1)
  echo "Current benchmark results size: $BENCH_SIZE"
  read -p "Would you like to clean benchmark results? (y/N): " clean_bench
  if [ "$clean_bench" == "y" ] || [ "$clean_bench" == "Y" ]; then
    echo "Cleaning benchmark results..."
    find ./benchmark/results -name "*.json" -type f -delete
    rm -rf ./benchmark/results/reports
    rm -rf ./benchmark/results/reports-before
    echo "Benchmark results cleaned."
  else
    echo "Skipping benchmark results cleaning."
  fi
fi

# Clean coverage reports
if [ -d "./coverage" ]; then
  COVERAGE_SIZE=$(du -sh ./coverage 2>/dev/null | cut -f1)
  echo "🧹 Current coverage report size: $COVERAGE_SIZE"
  read -p "Would you like to clean coverage reports? (y/N): " clean_coverage
  if [ "$clean_coverage" == "y" ] || [ "$clean_coverage" == "Y" ]; then
    echo "Cleaning coverage reports..."
    rm -rf ./coverage
    echo "Coverage reports cleaned."
  else
    echo "Skipping coverage reports cleaning."
  fi
fi

# Clean .nx cache if it's gotten too large
if [ -d "./.nx/cache" ]; then
  NX_CACHE_SIZE=$(du -sh .nx/cache 2>/dev/null | cut -f1)
  echo "🧹 Current .nx/cache size: $NX_CACHE_SIZE"
  read -p "Would you like to clean the Nx cache? This will require rebuilding projects (y/N): " clean_nx
  if [ "$clean_nx" == "y" ] || [ "$clean_nx" == "Y" ]; then
    echo "Cleaning Nx cache..."
    yarn nx reset
    echo "Nx cache cleaned."
  else
    echo "Skipping Nx cache cleaning."
  fi
fi

# Clean dist folders
echo "🧹 Checking dist folders..."
DIST_COUNT=$(find . -name "dist" -type d | wc -l | tr -d ' ')
if [ "$DIST_COUNT" -gt 0 ]; then
  echo "Found $DIST_COUNT dist directories"
  read -p "Would you like to remove all dist folders? This will require rebuilding projects (y/N): " clean_dist
  if [ "$clean_dist" == "y" ] || [ "$clean_dist" == "Y" ]; then
    echo "Removing dist folders..."
    find . -name "dist" -type d -exec rm -rf {} \; 2>/dev/null || find . -name "dist" -type d -exec rm -rf {} \+
    echo "Dist folders removed."
  else
    echo "Skipping dist folder removal."
  fi
else
  echo "No dist folders found"
fi

# Remove system files
echo "🧹 Cleaning system files (.DS_Store, Thumbs.db)..."
DS_STORE_COUNT=$(find . -name ".DS_Store" -type f | wc -l | tr -d ' ')
THUMBS_COUNT=$(find . -name "Thumbs.db" -type f | wc -l | tr -d ' ')
if [ "$DS_STORE_COUNT" -gt 0 ] || [ "$THUMBS_COUNT" -gt 0 ]; then
  echo "Found $DS_STORE_COUNT .DS_Store files and $THUMBS_COUNT Thumbs.db files"
  find . -name ".DS_Store" -type f -delete
  find . -name "Thumbs.db" -type f -delete
else
  echo "No system files found"
fi

# Remove tmp directories
echo "🧹 Cleaning tmp directories..."
TMP_COUNT=$(find . -name "tmp" -type d | wc -l | tr -d ' ')
if [ "$TMP_COUNT" -gt 0 ]; then
  echo "Found $TMP_COUNT tmp directories"
  find . -name "tmp" -type d -exec rm -rf {} \; 2>/dev/null || find . -name "tmp" -type d -exec rm -rf {} \+
else
  echo "No tmp directories found"
fi

echo "✨ Cleanup complete! ✨"
echo "--------------------------------------"
echo "You may need to rebuild your project with: yarn build"
