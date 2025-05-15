import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility to help identify undefined path issues
 * Do not import this file in production code
 */
export function inspectObject(obj: any, depth = 0, maxDepth = 3): string {
    if (depth > maxDepth) return '(max depth reached)';
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';

    if (typeof obj === 'object') {
        if (Array.isArray(obj)) {
            return `[${obj.map(item => inspectObject(item, depth + 1, maxDepth)).join(', ')}]`;
        }

        const entries = Object.entries(obj).map(
            ([key, value]) => `${key}: ${inspectObject(value, depth + 1, maxDepth)}`
        );
        return `{${entries.join(', ')}}`;
    }

    return String(obj);
}

/**
 * Safe file system operations that log errors
 */
export function safeReadDir(dirPath: string): string[] {
    try {
        return fs.existsSync(dirPath) ? fs.readdirSync(dirPath) : [];
    } catch (err) {
        console.error(`Error reading directory ${dirPath}:`, err);
        return [];
    }
}

/**
 * Check if a module can be safely required
 */
export function checkModule(modulePath: string): { exists: boolean, canRequire: boolean, exports?: string[] } {
    const exists = fs.existsSync(modulePath);

    if (!exists) {
        return { exists: false, canRequire: false };
    }

    try {
        const mod = require(modulePath);
        return {
            exists: true,
            canRequire: true,
            exports: Object.keys(mod)
        };
    } catch (err) {
        return { exists: true, canRequire: false };
    }
}

/**
 * Find files in a directory
 */
export function findFiles(dir: string, pattern: RegExp, results: string[] = []): string[] {
    if (!fs.existsSync(dir)) return results;

    const files = safeReadDir(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        try {
            if (fs.statSync(fullPath).isDirectory()) {
                findFiles(fullPath, pattern, results);
            } else if (pattern.test(file)) {
                results.push(fullPath);
            }
        } catch (err) {
            console.error(`Error accessing ${fullPath}:`, err);
        }
    }

    return results;
}
