#!/usr/bin/env node

/**
 * Test File Fixer Script
 * 
 * This script helps fix circular dependency issues in VS Code Extension test files.
 * It restructures test files to follow the proper pattern for Vitest mocks.
 * 
 * Usage: 
 * 1. Add execute permission: chmod +x fix-test-files.js
 * 2. Run: ./fix-test-files.js path/to/test/file.ts
 */

const fs = require('fs');
const path = require('path');

// Check if a file path was provided
if (process.argv.length < 3) {
    console.error('Please provide a test file path to fix');
    console.error('Example: node fix-test-files.js src/tests/some.test.ts');
    process.exit(1);
}

const filePath = process.argv[2];

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

// Read the file
const content = fs.readFileSync(filePath, 'utf8');

// Check if file has already been fixed
if (content.includes('// Import vi first for mocking') &&
    content.indexOf('import { vi') < content.indexOf('vi.mock(')) {
    console.log(`File ${filePath} already appears to be fixed.`);
    process.exit(0);
}

// Extract mock definitions
const vscodeMockMatch = content.match(/vi\.mock\(['"]vscode['"],\s*\(\)\s*=>\s*({[\s\S]*?})\);/);
const stylelintMockMatch = content.match(/vi\.mock\(['"]stylelint['"],\s*\(\)\s*=>\s*({[\s\S]*?})\);/);
const fsMockMatch = content.match(/vi\.mock\(['"]fs['"],\s*\(\)\s*=>\s*({[\s\S]*?})\);/);

const vscodeMock = vscodeMockMatch ? vscodeMockMatch[1] : null;
const stylelintMock = stylelintMockMatch ? stylelintMockMatch[1] : null;
const fsMock = fsMockMatch ? fsMockMatch[1] : null;

// Extract imports
const importMatches = content.matchAll(/import\s+(?:{([^}]*)}\s+from\s+['"]([^'"]*)['"]);?|import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]*)['"]/g);
const imports = [];
for (const match of importMatches) {
    const namedImport = match[1];
    const namedImportPath = match[2];
    const namespaceImport = match[3];
    const namespaceImportPath = match[4];

    if (namedImport && namedImportPath) {
        imports.push({ type: 'named', imports: namedImport, path: namedImportPath });
    } else if (namespaceImport && namespaceImportPath) {
        imports.push({ type: 'namespace', name: namespaceImport, path: namespaceImportPath });
    }
}

// Create the fixed file content
let fixedContent = `/**
 * ${path.basename(filePath)} - Fixed Version
 * 
 * Fixes circular dependency issues with proper mock ordering
 */

// Import vi first for mocking
import { vi } from 'vitest';

`;

// Add mocks
if (fsMock) {
    fixedContent += `// Mock file system
vi.mock('fs', () => (${fsMock}));\n\n`;
}

if (vscodeMock) {
    fixedContent += `// Mock VS Code APIs directly to avoid circular dependencies
vi.mock('vscode', () => (${vscodeMock}));\n\n`;
}

if (stylelintMock) {
    fixedContent += `// Mock stylelint
vi.mock('stylelint', () => (${stylelintMock}));\n\n`;
}

fixedContent += `// Now import the rest
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
`;

// Add namespace imports first
imports.forEach(imp => {
    if (imp.type === 'namespace' && imp.path !== 'vitest') {
        fixedContent += `import * as ${imp.name} from '${imp.path}';\n`;
    }
});

// Add named imports
imports.forEach(imp => {
    if (imp.type === 'named' && imp.path !== 'vitest') {
        fixedContent += `import { ${imp.imports} } from '${imp.path}';\n`;
    }
});

// Add the rest of the original file, removing the import/mock part
const restOfFileMatch = content.match(/describe\(['"][^'"]*['"]/);
if (restOfFileMatch) {
    const startPos = content.indexOf(restOfFileMatch[0]);
    if (startPos !== -1) {
        fixedContent += '\n' + content.substring(startPos);
    } else {
        console.error('Could not find the test suite in the file');
        process.exit(1);
    }
} else {
    console.error('Could not find the test suite in the file');
    process.exit(1);
}

// Write the fixed content to a new file
const dir = path.dirname(filePath);
const ext = path.extname(filePath);
const base = path.basename(filePath, ext);
const fixedFilePath = path.join(dir, `${base}.fixed${ext}`);

fs.writeFileSync(fixedFilePath, fixedContent);
console.log(`Fixed file written to ${fixedFilePath}`);
console.log('Verify the fixed file, then rename it to replace the original if it works correctly.');
