# Project Maintenance Tools

This repository includes several tools to help maintain a clean workspace and prepare packages for publishing.

## Cleanup Scripts

### Interactive Cleanup

Run the interactive cleanup script to remove temporary files and build artifacts:

```bash
# Using npm script
npm run cleanup:interactive

# Or directly
./tools/cleanup.sh
```

This script will:
- Remove TypeScript build info files (*.tsbuildinfo)
- Remove source map files (*.map)
- Remove VS Code extension packages (*.vsix)
- Clean .nx cache (optional)
- Remove dist folders (optional)
- Remove system files (.DS_Store, Thumbs.db)
- Remove tmp directories
- Clean benchmark results (optional)
- Clean coverage reports (optional)

### Quick Cleanup Commands

For quick cleanup of specific file types:

```bash
# Clean up only build artifacts
npm run cleanup:artifacts

# Full cleanup including nx cache
npm run cleanup:full

# Reset nx cache and remove dist folders
npm run clean
```

### Publish Preparation

Before publishing packages, run the publish preparation script:

```bash
npm run prepare:publish
```

This will clean up unnecessary files in each package directory and verify that build artifacts exist.

### Periodic Cleanup

For automated maintenance, you can set up a cron job to run the periodic cleanup script:

```bash
# Example crontab entry (runs weekly on Sunday at midnight)
0 0 * * 0 /path/to/old-fashioned/tools/periodic-cleanup.sh
```

The periodic cleanup script:
- Removes common temporary files
- Cleans benchmark results older than 7 days
- Cleans the Nx cache if it exceeds 500MB
- Maintains a log of cleanup activities

## Update .gitignore

The following patterns are included in .gitignore to prevent committing temporary files:

```
# Build artifacts
dist/
*.tsbuildinfo
*.map
*.vsix

# Benchmark results
benchmark/results/**/*.json
benchmark/results/reports/
benchmark/results/reports-before/

# Cache and temporary files
.nx/cache
.nx/workspace-data
tmp/
```
