/**
 * Benchmark for testing CSS/SCSS file parsing and sorting
 */
import {
    smallCssFlat,
    mediumCssFlat,
    largeCssFlat,
    smallScssNested,
    mediumScssNested,
    largeScssNested
} from './fixtures/css-samples.js';
import { performance } from 'perf_hooks';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SortingOptions } from '../packages/shared/src/types.js';

// Add fileURLToPath conversion for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a mock css parser function since the real one doesn't exist yet
async function sortCssFile(content: string, options: SortingOptions): Promise<{ output: string, changed: boolean }> {
    // Simple mock implementation that just returns the content
    // In a real implementation, this would parse CSS and sort properties
    await new Promise(resolve => setTimeout(resolve, 1)); // Simulate some work
    return {
        output: content,
        changed: false
    };
}

interface CssBenchmarkResult {
    name: string;
    fileType: 'css' | 'scss';
    complexity: 'small' | 'medium' | 'large';
    structure: 'flat' | 'nested';
    contentSize: number;  // Size in bytes
    parseTime: number;    // Time in ms
    sortTime: number;     // Time in ms
    totalTime: number;    // Time in ms
    operationsPerSecond: number;
}

/**
 * Run a benchmark for parsing and sorting a CSS/SCSS file
 */
async function benchmarkCssFile(
    name: string,
    content: string,
    fileType: 'css' | 'scss',
    complexity: 'small' | 'medium' | 'large',
    structure: 'flat' | 'nested',
    iterations: number = 100
): Promise<CssBenchmarkResult> {
    console.log(`Benchmarking ${name}...`);

    const timings: { parse: number, sort: number, total: number }[] = [];

    // Warm-up
    for (let i = 0; i < 5; i++) {
        await sortCssFile(content, { strategy: 'alphabetical' });
    }

    // Actual benchmark
    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();

        // Here we would typically split parse and sort timing, but for now we'll measure it together
        const parseStartTime = performance.now();
        const parseResult = await sortCssFile(content, { strategy: 'alphabetical' });
        const parseEndTime = performance.now();

        const sortStartTime = performance.now();
        // Sort operation would go here if it was separate
        const sortEndTime = performance.now();

        const endTime = performance.now();

        timings.push({
            parse: parseEndTime - parseStartTime,
            sort: sortEndTime - sortStartTime,
            total: endTime - startTime
        });
    }

    // Calculate statistics
    const parseTime = timings.reduce((sum, timing) => sum + timing.parse, 0) / iterations;
    const sortTime = timings.reduce((sum, timing) => sum + timing.sort, 0) / iterations;
    const totalTime = timings.reduce((sum, timing) => sum + timing.total, 0) / iterations;
    const operationsPerSecond = 1000 / totalTime;

    return {
        name,
        fileType,
        complexity,
        structure,
        contentSize: Buffer.from(content).length,
        parseTime,
        sortTime,
        totalTime,
        operationsPerSecond
    };
}

/**
 * Save benchmark results to a JSON file
 */
function saveBenchmarkResults(results: CssBenchmarkResult[], filename: string): void {
    const resultsDir = path.join(__dirname, 'results');

    // Create results directory if it doesn't exist
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filePath = path.join(resultsDir, `${filename}.json`);

    // Check if file exists and append results or create new file
    let existingResults: CssBenchmarkResult[] = [];

    if (fs.existsSync(filePath)) {
        try {
            existingResults = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (error) {
            console.error(`Error reading existing results file: ${error}`);
        }
    }

    const allResults = [...existingResults, ...results];

    fs.writeFileSync(filePath, JSON.stringify(allResults, null, 2), 'utf-8');
    console.log(`CSS benchmark results saved to ${filePath}`);
}

/**
 * Run benchmarks for all CSS/SCSS samples
 */
async function runCssBenchmarks() {
    try {
        console.log('Running CSS/SCSS parsing and sorting benchmarks...');

        const results: CssBenchmarkResult[] = [];

        // Test flat CSS files
        results.push(await benchmarkCssFile(
            'Small Flat CSS',
            smallCssFlat,
            'css',
            'small',
            'flat',
            100
        ));

        results.push(await benchmarkCssFile(
            'Medium Flat CSS',
            mediumCssFlat,
            'css',
            'medium',
            'flat',
            50
        ));

        results.push(await benchmarkCssFile(
            'Large Flat CSS',
            largeCssFlat,
            'css',
            'large',
            'flat',
            20
        ));

        // Test nested SCSS files
        results.push(await benchmarkCssFile(
            'Small Nested SCSS',
            smallScssNested,
            'scss',
            'small',
            'nested',
            100
        ));

        results.push(await benchmarkCssFile(
            'Medium Nested SCSS',
            mediumScssNested,
            'scss',
            'medium',
            'nested',
            50
        ));

        results.push(await benchmarkCssFile(
            'Large Nested SCSS',
            largeScssNested,
            'scss',
            'large',
            'nested',
            20
        ));

        // Save results
        saveBenchmarkResults(results, 'css-parsing-benchmark');

        console.log('CSS/SCSS benchmarks completed!');

        // Print summary
        console.log('\nSummary:');
        console.table(results.map(r => ({
            name: r.name,
            size: `${(r.contentSize / 1024).toFixed(2)} KB`,
            time: `${r.totalTime.toFixed(2)} ms`,
            ops: `${r.operationsPerSecond.toFixed(2)}/sec`
        })));

    } catch (error) {
        console.error('Error running CSS benchmarks:', error);
    }
}

// Export the benchmark function and check for direct execution
export { runCssBenchmarks };

// More reliable way to detect direct execution in ESM
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runCssBenchmarks().catch(console.error);
}
