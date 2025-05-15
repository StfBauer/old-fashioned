const path = require('path');
const { buildWithEsbuild } = require('./config');
const minimist = require('minimist');

// Parse command line arguments
const args = minimist(process.argv.slice(2));
const project = args.project;

if (!project) {
    console.error('Please provide a project name with --project');
    process.exit(1);
}

// Project-specific configurations
const configs = {
    'stylelint-oldfashioned-order': {
        entryPoint: 'src/index.ts',
        outfile: 'dist/src/index.js',
        format: 'cjs',
        external: ['stylelint', 'postcss', 'stylelint-order']
    },
    'vscode-old-fashioned': {
        entryPoint: 'src/extension.ts',
        outfile: 'dist/extension.js',
        format: 'cjs',
        external: ['vscode']
    }
    // Add more project configs as needed
};

const config = configs[project];
if (!config) {
    console.error(`No configuration found for project: ${project}`);
    process.exit(1);
}

// Run the build
buildWithEsbuild(config)
    .then(() => console.log(`Build completed for ${project}`))
    .catch(err => {
        console.error(`Build failed for ${project}:`, err);
        process.exit(1);
    });
