// esbuild config for vscode-old-fashioned package
const { build } = require('esbuild');

build({
    entryPoints: ['src/extension.ts'],
    outdir: 'dist', //  Make sure this matches where package.json's "main" expects the file
    bundle: true, // Bundle all code into one file
    platform: 'node',
    target: ['node18'],
    sourcemap: true,
    format: 'cjs',
    tsconfig: './tsconfig.json',
    logLevel: 'info',
    external: ['vscode', 'stylelint/lib/utils'], // Exclude vscode and stylelint/lib/utils from the bundle
}).catch(() => process.exit(1));
