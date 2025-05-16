#!/bin/bash

# Old-Fashioned Periodic Cleanup
# This script is designed to be run as a cron job to clean up unwanted files
# Recommended usage: Set a cron job to run this script weekly
# Example crontab entry: 0 0 * * 0 /path/to/old-fashioned/tools/periodic-cleanup.sh

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Navigate to project directory
cd "$PROJECT_DIR" || exit 1

# Create a log file with timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$PROJECT_DIR/logs/periodic_cleanup_$TIMESTAMP.log"
mkdir -p "$PROJECT_DIR/logs"

echo "Old-Fashioned Periodic Cleanup - $(date)" > "$LOG_FILE"
echo "=======================================" >> "$LOG_FILE"

# Function to log messages
log() {
  echo "$1" | tee -a "$LOG_FILE"
}

log "Starting periodic cleanup..."

# Remove TypeScript build info files
log "Removing *.tsbuildinfo files..."
find . -name "*.tsbuildinfo" -type f -delete >> "$LOG_FILE" 2>&1

# Remove source map files
log "Removing *.map files..."
find . -name "*.map" -type f -delete >> "$LOG_FILE" 2>&1

# Remove system files
log "Removing system files (.DS_Store, Thumbs.db)..."
find . -name ".DS_Store" -type f -delete >> "$LOG_FILE" 2>&1
find . -name "Thumbs.db" -type f -delete >> "$LOG_FILE" 2>&1

# Clean benchmark results if they're older than 7 days
if [ -d "./benchmark/results" ]; then
  log "Cleaning old benchmark results..."
  find ./benchmark/results -name "*.json" -type f -mtime +7 -delete >> "$LOG_FILE" 2>&1
fi

# Remove old logs (older than 30 days)
log "Removing old logs..."
find "$PROJECT_DIR/logs" -name "periodic_cleanup_*.log" -type f -mtime +30 -delete >> "$LOG_FILE" 2>&1

# Clean .nx cache if it's gotten too large (>500MB)
if [ -d "./.nx/cache" ]; then
  CACHE_SIZE_KB=$(du -sk .nx/cache 2>/dev/null | cut -f1)
  if [ "$CACHE_SIZE_KB" -gt 500000 ]; then  # 500MB in KB
    log "Nx cache size is $(($CACHE_SIZE_KB / 1024))MB, cleaning..."
    yarn nx reset >> "$LOG_FILE" 2>&1
    log "Nx cache cleaned."
  else
    log "Nx cache size is $(($CACHE_SIZE_KB / 1024))MB, skipping cleanup."
  fi
fi

# Done
log "Periodic cleanup completed at $(date)"
log "See the full log at: $LOG_FILE"

# Keep only last 10 log files
log "Cleaning up old log files..."
cd "$PROJECT_DIR/logs" || exit 1
ls -t periodic_cleanup_*.log | tail -n +11 | xargs -I {} rm {} 2>/dev/null

exit 0
