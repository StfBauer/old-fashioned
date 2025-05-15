const { build } = require('esbuild');

/**
 * Creates a consistent ESBuild configuration for Nx packages
 * @param {Object} options - Build options
 */
async function buildWithEsbuild({
    entryPoint = 'src/index.ts',
    outfile = 'dist/index.js',
    format = 'cjs',
    platform = 'node',
    external = [],
    minify = false,
    sourcemap = true
} = {}) {
    await build({
        entryPoints: [entryPoint],
        bundle: true,
        platform,
        target: 'node14',
        format,
        outfile,
        external,
        minify,
        sourcemap,
        logLevel: 'info'
    });
}

module.exports = { buildWithEsbuild };
