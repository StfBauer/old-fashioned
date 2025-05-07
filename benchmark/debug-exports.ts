/**
 * Debug script to check exports from shared package
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get proper paths in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Try different import paths to see what works
console.log('Attempting to import shared package...');

try {
    const sharedPackage = await import('../packages/shared/src/index.js');
    console.log('Exports from shared package index:');
    console.log(Object.keys(sharedPackage));
} catch (error: unknown) {
    console.error('Error importing from index.js:', error instanceof Error ? error.message : String(error));
}

try {
    const sortingModule = await import('../packages/shared/src/sorting.js');
    console.log('Exports from sorting module:');
    console.log(Object.keys(sortingModule));
} catch (error: unknown) {
    console.error('Error importing from sorting.js:', error instanceof Error ? error.message : String(error));
}

// Check file existence
console.log('\nChecking file existence:');
const packagePath = path.join(__dirname, '..', 'packages', 'shared');
const indexPath = path.join(packagePath, 'src', 'index.ts');
const sortingPath = path.join(packagePath, 'src', 'sorting.ts');
const distIndexPath = path.join(packagePath, 'dist', 'index.js');

console.log(`index.ts exists: ${fs.existsSync(indexPath)}`);
console.log(`sorting.ts exists: ${fs.existsSync(sortingPath)}`);
console.log(`dist/index.js exists: ${fs.existsSync(distIndexPath)}`);

// If the dist version exists, try to require it (CommonJS way)
if (fs.existsSync(distIndexPath)) {
    try {
        const contents = fs.readFileSync(distIndexPath, 'utf8');
        console.log('\nFirst 200 chars of dist/index.js:');
        console.log(contents.substring(0, 200) + '...');
    } catch (error) {
        console.error('Error reading dist file:', error);
    }
}
