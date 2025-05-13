/**
 * This script verifies that the stylelint-oldfashioned-order plugin is correctly installed
 * and can be loaded by the extension.
 */

try {
    // Try to require the plugin directly
    const plugin = require('stylelint-oldfashioned-order');
    console.log('✅ Plugin can be loaded directly:', plugin ? 'Successfully loaded' : 'Failed to load');

    // Get the plugin's package.json
    const packageJson = require('stylelint-oldfashioned-order/package.json');
    console.log('✅ Plugin package.json found:', packageJson.name, packageJson.version);

    // Try to load the plugin's main file
    const mainFile = require.resolve('stylelint-oldfashioned-order');
    console.log('✅ Plugin main file resolved at:', mainFile);

    // Check if the ruleName is available
    if (plugin.ruleName) {
        console.log('✅ Plugin rule name:', plugin.ruleName);
    } else {
        console.log('⚠️ Plugin rule name not found');
    }

    console.log('\n🎉 Plugin verification complete! The plugin appears to be correctly installed.');
} catch (error) {
    console.error('❌ Plugin verification failed!');
    console.error(error.message);
    console.error('\nModule resolution paths:');
    console.error(module.paths);

    // Try to check a specific path that should contain the plugin
    const fs = require('fs');
    const path = require('path');

    const possiblePaths = [
        path.resolve(__dirname, '../node_modules/stylelint-oldfashioned-order'),
        path.resolve(__dirname, '../../node_modules/stylelint-oldfashioned-order'),
        path.resolve(__dirname, '../../../node_modules/stylelint-oldfashioned-order')
    ];

    console.log('\nChecking for plugin in possible locations:');
    for (const pluginPath of possiblePaths) {
        if (fs.existsSync(pluginPath)) {
            console.log(`✅ Found at: ${pluginPath}`);
            // Check if package.json exists
            if (fs.existsSync(path.join(pluginPath, 'package.json'))) {
                console.log(`  - package.json exists`);
            } else {
                console.log(`  - ❌ package.json missing!`);
            }
            // Check if dist folder exists
            if (fs.existsSync(path.join(pluginPath, 'dist'))) {
                console.log(`  - dist folder exists`);
            } else {
                console.log(`  - ❌ dist folder missing!`);
            }
        } else {
            console.log(`❌ Not found at: ${pluginPath}`);
        }
    }
}
