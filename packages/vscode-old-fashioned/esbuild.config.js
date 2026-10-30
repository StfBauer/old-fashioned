// esbuild config for vscode-old-fashioned package
const esbuild = require('esbuild');
const path = require('path');

// css-tree loads JSON at runtime via createRequire, which cannot work from a bundle.
// Its dist/ folder holds the same modules with the data embedded, intended for bundlers.
const cssTreeBundledData = {
    name: 'css-tree-bundled-data',
    setup(build) {
        build.onResolve({ filter: /(data|version)\.js$/ }, (args) => {
            const resolved = path.resolve(args.resolveDir, args.path);
            const match = resolved.match(/^(.*[\\/]css-tree)[\\/]lib[\\/]((?:data|version)\.js)$/);
            return match ? { path: path.join(match[1], 'dist', match[2]) } : undefined;
        });
    },
};

const options = {
    plugins: [cssTreeBundledData],
    entryPoints: ['src/extension.ts'],
    outfile: 'dist/extension.js', // Make sure this matches where package.json's "main" expects the file
    bundle: true, // Bundle all code into one file
    platform: 'node',
    target: ['node18'],
    sourcemap: true,
    minify: true,
    format: 'cjs',
    tsconfig: './tsconfig.json',
    logLevel: 'info',
    external: ['vscode'],
    // stylelint is ESM and reads ../../package.json relative to import.meta.url when loaded.
    // Pointing it one folder below dist/ makes that resolve to the extension's package.json.
    banner: {
        js: 'const __importMetaUrl = require("url").pathToFileURL(require("path").join(__dirname, "stylelint", "index.js")).href;',
    },
    define: {
        'import.meta.url': '__importMetaUrl',
    },
};

if (process.argv.includes('--watch')) {
    esbuild.context(options).then((ctx) => ctx.watch()).catch(() => process.exit(1));
} else {
    esbuild.build(options).catch(() => process.exit(1));
}
