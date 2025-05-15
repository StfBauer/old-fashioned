const esbuild = require('esbuild');

async function build() {
    await esbuild.build({
        entryPoints: ['./src/extension.ts'], // Adjust this to your main extension file
        bundle: true,
        outfile: 'dist/extension.js',
        platform: 'node', // Set platform to Node.js instead of browser
        target: 'node14', // Target the Node.js version used by VS Code
        format: 'cjs', // CommonJS format for VS Code extensions
        sourcemap: true,
        external: [
            'vscode', // Mark VS Code API as external
            // Externalize problematic modules that might cause the name property error
            'uuid',
            '@azure/msal-node',
            'crypto'
        ],
        // This banner will be included at the start of your bundle to allow function name assignments
        banner: {
            js: '/* eslint-disable */ "use strict"; (() => { const defineProperty = Object.defineProperty; Object.defineProperty = function(obj, prop, desc) { if(prop === "name" && typeof obj === "function") { return obj; } return defineProperty(obj, prop, desc); }; })();'
        },
        // Add these options to help with the UUID library issue
        minifySyntax: false,        // Reduce aggressive transformations
        keepNames: true,           // Preserve function names
        charset: 'utf8',           // Ensure proper character encoding
        legalComments: 'inline',   // Keep comments that might contain directives
        // Create a more Node.js friendly environment
        mainFields: ['module', 'main'],
        conditions: ['node']
    });
}

build().catch(e => {
    console.error(e);
    process.exit(1);
});
