/**
 * CSS Property Sorting Benchmark
 * 
 * This benchmark compares different sorting algorithms and strategies
 * for CSS properties to find the optimal approach for various file sizes.
 */
import * as fs from 'fs';
import * as path from 'path';
import { sortProperties } from '../src/sorting';
import { sortCssProperties } from '../src/sorting-engine';
import { SortingOptions } from '../src/types';

// Configuration
const ITERATIONS = 100;
const TEST_FILES_DIR = path.join(__dirname, 'test-files');
const RESULTS_DIR = path.join(__dirname, 'results');

// Ensure results directory exists
if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
}

/**
 * Run benchmark for a specific test file and sorting configuration
 */
function runBenchmark(
    filePath: string,
    options: SortingOptions,
    iterations: number = ITERATIONS
): { mean: number; median: number; min: number; max: number } {
    const fileName = path.basename(filePath);
    console.log(`Running benchmark for ${fileName} with strategy: ${options.strategy}...`);

    try {
        // Read the test file
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Extract CSS properties for testing
        // (This is a simplified version - you'd need a real CSS parser for actual files)
        const cssPropertiesPattern = /([a-zA-Z-]+)\s*:/g;
        const matches = fileContent.match(cssPropertiesPattern) || [];
        const properties = matches.map(match => match.replace(':', '').trim());

        console.log(`Found ${properties.length} properties in file`);

        // Run the benchmark
        const times: number[] = [];

        for (let i = 0; i < iterations; i++) {
            const start = performance.now();

            if (options.algorithm) {
                // Use the sorting engine if algorithm is specified
                sortCssProperties(properties, options);
            } else {
                // Use the basic sorter otherwise
                sortProperties(properties, options);
            }

            const end = performance.now();
            times.push(end - start);
        }

        // Calculate statistics
        times.sort((a, b) => a - b);
        const min = times[0];
        const max = times[times.length - 1];
        const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
        const median = times[Math.floor(times.length / 2)];

        console.log(`Results for ${fileName} (${options.strategy}, ${options.algorithm || 'default'}):`);
        console.log(`  Mean: ${mean.toFixed(3)} ms`);
        console.log(`  Median: ${median.toFixed(3)} ms`);
        console.log(`  Min: ${min.toFixed(3)} ms`);
        console.log(`  Max: ${max.toFixed(3)} ms`);

        return { mean, median, min, max };
    } catch (error) {
        console.error(`Error benchmarking ${fileName}:`, error);
        return { mean: 0, median: 0, min: 0, max: 0 };
    }
}

/**
 * Run comprehensive benchmarks for all test files and strategies
 */
async function runComprehensiveBenchmarks() {
    const strategies = ['alphabetical', 'grouped', 'concentric'];
    const algorithms = ['standard', 'hashmap', 'radix'];
    const files = fs.readdirSync(TEST_FILES_DIR)
        .filter(file => file.endsWith('.css') || file.endsWith('.scss'))
        .map(file => path.join(TEST_FILES_DIR, file));

    const results: Record<string, any> = {};

    for (const file of files) {
        const fileName = path.basename(file);
        results[fileName] = {};

        for (const strategy of strategies) {
            results[fileName][strategy] = {};

            for (const algorithm of algorithms) {
                const options: SortingOptions = {
                    strategy: strategy as any,
                    algorithm: algorithm as any,
                    emptyLinesBetweenGroups: false,
                    sortPropertiesWithinGroups: true
                };

                const benchmarkResult = runBenchmark(file, options);
                results[fileName][strategy][algorithm] = benchmarkResult;
            }

            // Also test with empty lines between groups
            const withEmptyLines: SortingOptions = {
                strategy: strategy as any,
                emptyLinesBetweenGroups: true,
                sortPropertiesWithinGroups: true
            };

            const emptyLinesResult = runBenchmark(file, withEmptyLines);
            results[fileName][strategy]['with_empty_lines'] = emptyLinesResult;
        }
    }

    // Save results to file
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const resultFile = path.join(RESULTS_DIR, `benchmark-results-${date}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log(`Benchmark results saved to ${resultFile}`);
}

// Run benchmarks
runComprehensiveBenchmarks().catch(console.error);
