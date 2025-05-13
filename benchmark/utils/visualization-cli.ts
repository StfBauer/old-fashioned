/**
 * CLI for visualizing benchmark results
 */
import * as fs from 'fs';
import * as path from 'path';
import { generateHtmlReport, saveHtmlReport } from './visualization.js';
import { generateMarkdownReport, saveMarkdownReport } from './markdown-report.js';

// Path to results directory
const resultsDir = path.join(__dirname, '..', 'results');

async function visualizeResults() {
    // Check if results directory exists
    if (!fs.existsSync(resultsDir)) {
        console.error('No results directory found. Run benchmarks first.');
        process.exit(1);
    }

    // Get all JSON files in results directory
    const files = fs.readdirSync(resultsDir)
        .filter(file => file.endsWith('.json'));

    if (files.length === 0) {
        console.error('No benchmark results found. Run benchmarks first.');
        process.exit(1);
    }

    console.log(`Found ${files.length} benchmark result files`);

    // Generate reports for each file
    for (const file of files) {
        const filePath = path.join(resultsDir, file);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        const reportName = file.replace('.json', '');
        const title = reportName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ') + ' Benchmark Results';

        console.log(`Generating reports for ${reportName}...`);

        // Generate HTML report
        const html = generateHtmlReport(data, title);
        saveHtmlReport(html, reportName);

        // Generate Markdown report
        const markdown = generateMarkdownReport(data, title);
        saveMarkdownReport(markdown, reportName);
    }

    console.log('Visualization complete! Reports are available in the results/reports directory.');
}

// Run the visualization
visualizeResults().catch(err => {
    console.error('Error visualizing results:', err);
    process.exit(1);
});
