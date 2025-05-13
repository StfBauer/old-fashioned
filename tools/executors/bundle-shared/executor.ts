import { ExecutorContext } from '@nrwl/devkit';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface BundleSharedExecutorOptions {
    outputPath?: string;
}

export default async function bundleSharedExecutor(
    options: BundleSharedExecutorOptions,
    context: ExecutorContext
) {
    console.log('Bundling shared into stylelint-oldfashioned-order...');

    try {
        // Build both packages
        console.log('Building shared package...');
        execSync('nx build shared', { stdio: 'inherit' });

        console.log('Building stylelint-oldfashioned-order...');
        execSync('nx build stylelint-oldfashioned-order', { stdio: 'inherit' });

        // Get paths from workspace
        const workspaceRoot = context.root;
        const sharedDistDir = path.join(workspaceRoot, 'dist/packages/shared');
        const pluginDistDir = path.join(workspaceRoot, 'dist/packages/stylelint-oldfashioned-order');
        const pluginLibDir = path.join(pluginDistDir, 'lib');

        // Create lib directory if it doesn't exist
        if (!fs.existsSync(pluginLibDir)) {
            fs.mkdirSync(pluginLibDir, { recursive: true });
        }

        // Copy shared files to the plugin's lib directory
        console.log('Copying shared library files...');
        fs.readdirSync(sharedDistDir).forEach(file => {
            if (file.endsWith('.js') || file.endsWith('.d.ts')) {
                fs.copyFileSync(
                    path.join(sharedDistDir, file),
                    path.join(pluginLibDir, file)
                );
            }
        });

        // Update imports in compiled files
        console.log('Updating imports...');
        const distFiles = getAllFiles(pluginDistDir, ['.js']);
        distFiles.forEach(file => {
            let content = fs.readFileSync(file, 'utf8');
            content = content.replace(
                /require\(['"]@old-fashioned\/shared['"]\)/g,
                'require("./lib/index")'
            );
            content = content.replace(
                /from ['"]@old-fashioned\/shared['"]/g,
                'from "./lib/index"'
            );
            fs.writeFileSync(file, content);
        });

        // Update package.json for publishing
        const packageJsonPath = path.join(workspaceRoot, 'packages/stylelint-oldfashioned-order/package.json');
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Remove shared dependency
        if (packageJson.dependencies && packageJson.dependencies['@old-fashioned/shared']) {
            delete packageJson.dependencies['@old-fashioned/shared'];
        }

        // Write modified package.json to dist
        fs.writeFileSync(
            path.join(pluginDistDir, 'package.json'),
            JSON.stringify(packageJson, null, 2)
        );

        // Copy README and license
        const readmePath = path.join(workspaceRoot, 'packages/stylelint-oldfashioned-order/README.md');
        if (fs.existsSync(readmePath)) {
            fs.copyFileSync(readmePath, path.join(pluginDistDir, 'README.md'));
        }

        console.log('Bundle completed successfully!');
        return { success: true };
    } catch (error) {
        console.error('Bundle failed:', error);
        return { success: false };
    }
}

function getAllFiles(dir: string, extensions: string[] = []): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(filePath, extensions));
        } else {
            if (extensions.length === 0 || extensions.some(ext => file.endsWith(ext))) {
                results.push(filePath);
            }
        }
    });
    return results;
}
