/**
 * Ensures required packages are installed
 */
import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import { outputChannel } from './extension';

const execAsync = promisify(exec);

/**
 * Package requirement definition
 */
export interface PackageRequirement {
    name: string;
    version: string;
}

/**
 * Ensures that required packages are installed
 */
export async function ensurePackages(
    requiredPackages: PackageRequirement[]
): Promise<void> {
    const extensionPath = path.resolve(__dirname, '..');
    const nodeModulesPath = path.join(extensionPath, 'node_modules');

    if (!fs.existsSync(nodeModulesPath)) {
        fs.mkdirSync(nodeModulesPath, { recursive: true });
    }

    const missingPackages = requiredPackages.filter(pkg => {
        const pkgPath = path.join(nodeModulesPath, pkg.name);
        return !fs.existsSync(pkgPath);
    });

    if (missingPackages.length > 0) {
        outputChannel.appendLine(`Installing missing dependencies: ${missingPackages.map(p => p.name).join(', ')}`);

        try {
            const installCommand = `npm install --no-save ${missingPackages
                .map(pkg => `${pkg.name}@${pkg.version}`)
                .join(' ')}`;

            outputChannel.appendLine(`Running: ${installCommand}`);
            await execAsync(installCommand, { cwd: extensionPath });
            outputChannel.appendLine('Dependencies installed successfully');
        } catch (error) {
            outputChannel.appendLine(`Failed to install dependencies: ${error}`);
            throw new Error(`Failed to install required packages: ${error}`);
        }
    }
}

/**
 * Find the binary path for a given package
 */
export function findBinary(binaryName: string): string | null {
    const extensionPath = path.resolve(__dirname, '..');

    const possiblePaths = [
        path.join(extensionPath, 'node_modules', '.bin', binaryName),
        path.join(extensionPath, '..', 'node_modules', '.bin', binaryName),
        path.join(extensionPath, '..', '..', 'node_modules', '.bin', binaryName),
        path.join(extensionPath, 'node_modules', binaryName, 'bin', binaryName)
    ];

    for (const binPath of possiblePaths) {
        if (fs.existsSync(binPath)) {
            return binPath;
        }
    }

    return null;
}
