const { build } = require('esbuild');
const { dependencies, peerDependencies } = require('./package.json');

const shared = {
    entryPoints: ['src/index.ts'],
    bundle: true,
    platform: 'node',
    target: 'node14',
    external: [...Object.keys(dependencies || {}), ...Object.keys(peerDependencies || {})],
    sourcemap: true,
};

build({
    ...shared,
    outfile: 'dist/src/index.js',
    format: 'cjs',
});
