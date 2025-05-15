// esbuild.config.js for VS Code extension
const { build } = require('esbuild');

build({
    entryPoints: ['src/extension.ts'],
    bundle: true,
    outfile: 'dist/extension.js',
    external: ['vscode'],
    platform: 'node',
    format: 'cjs',
    sourcemap: true,
    logLevel: 'info'
})
    .catch(() => process.exit(1));
