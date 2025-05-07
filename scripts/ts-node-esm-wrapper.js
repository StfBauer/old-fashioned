#!/usr/bin/env node

// A custom wrapper for better ts-node/esm compatibility
import { spawnSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const args = process.argv.slice(2);
if (!args.length) {
    console.error('Please provide a file to run');
    process.exit(1);
}

// Run ts-node with the proper flags for ESM support
const result = spawnSync('node', [
    '--loader', 'ts-node/esm',
    '--no-warnings',
    ...args
], {
    stdio: 'inherit',
    cwd: projectRoot
});

process.exit(result.status || 0);
