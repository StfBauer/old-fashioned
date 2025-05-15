// esbuild config for stylelint-oldfashioned-order
const { build } = require('esbuild');

build({
    entryPoints: ['src/index.ts'],
    bundle: true, // Bundle all code into one file
    outfile: 'dist/index.js', // Output a single file
    platform: 'node',
    target: ['node18'],
    sourcemap: true,
    format: 'cjs',
    tsconfig: './tsconfig.json',
    logLevel: 'info',
    external: ['stylelint/lib/utils'], // Exclude stylelint/lib/utils from the bundle
}).catch(() => process.exit(1));
