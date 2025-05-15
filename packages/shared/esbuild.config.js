// esbuild config for shared package
const { build } = require('esbuild');

build({
    entryPoints: ['src/index.ts'],
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    target: ['node18'],
    sourcemap: true,
    format: 'cjs',
    tsconfig: './tsconfig.json',
    logLevel: 'info',
    external: ['stylelint/lib/utils'], // Exclude stylelint/lib/utils from the bundle
}).catch(() => process.exit(1));
