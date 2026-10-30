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
    // stylelint expects the plugin as module.exports when loading it by package name
    footer: { js: 'module.exports = module.exports.default;' },
    external: ['stylelint', 'postcss'], // Use the versions the consumer installs
}).catch(() => process.exit(1));
