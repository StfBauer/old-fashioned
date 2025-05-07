/**
 * Benchmark runner for CSS property sorting strategies
 */
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { performance } from 'perf_hooks';
// First, let's try to import the whole module
import * as shared from '../../packages/shared/dist/index.js';
import { SortingOptions } from '../../packages/shared/src/types.js';

// Add fileURLToPath conversion for ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a fallback sorting function in case we can't find the real one
function sortPropertiesFallback(properties: string[], options: SortingOptions): string[] {
    console.log('Warning: Using fallback sorting function. Real implementation not found!');
    // Simple alphabetical sort as fallback
    return [...properties].sort();
}

// Add a utility function to handle nested CSS rules
function processNestedRules(properties: string[], options: SortingOptions): string[] {
    // Placeholder for handling nested rules
    // This function will recursively process nested rules if needed
    return properties.map(property => {
        // Example: Add logic to handle nested rules here
        return property;
    });
}

// Find the actual sorting function if available
const sortPropertiesFunction =
    (typeof shared === 'object' && 'sortProperties' in shared) ? (properties: string[], options: SortingOptions) => {
        const result = shared.sortProperties(properties, options);
        if (result.success && result.sortedProperties) {
            return result.sortedProperties;
        }
        throw new Error(result.error || 'Sorting failed');
    } :
        sortPropertiesFallback;

// Log what we found to help with debugging
console.log('Available exports from shared package:', Object.keys(shared));
console.log('Using sort function:', sortPropertiesFunction.name || 'anonymous function');

/**
 * Result of a single benchmark test
 */
export interface BenchmarkResult {
    name: string;
    strategy: string;
    inputSize: number;
    iterations: number;
    totalTimeMs: number;
    averageTimeMs: number;
    medianTimeMs: number;
    minTimeMs: number;
    maxTimeMs: number;
    operationsPerSecond: number;
    timestamp: string;
}

/**
 * Options for running benchmarks
 */
export interface BenchmarkOptions {
    name: string;
    properties: string[];
    sortingOptions: SortingOptions;
    iterations?: number;
    warmupIterations?: number;
}

/**
 * Run a benchmark for a specific sorting strategy and property set
 */
export function runBenchmark(options: BenchmarkOptions): BenchmarkResult {
    const {
        name,
        properties,
        sortingOptions,
        iterations = 1000,
        warmupIterations = 10
    } = options;

    // Warmup to avoid JIT compilation affecting results
    for (let i = 0; i < warmupIterations; i++) {
        sortPropertiesFunction([...properties], sortingOptions);
    }

    // Run the actual benchmark
    const timings: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        sortPropertiesFunction([...properties], sortingOptions);
        const endTime = performance.now();

        timings.push(endTime - startTime);
    }

    // Calculate statistics
    timings.sort((a, b) => a - b); // Sort for median calculation

    const totalTimeMs = timings.reduce((sum, time) => sum + time, 0);
    const averageTimeMs = totalTimeMs / iterations;
    const medianTimeMs = iterations % 2 === 0
        ? (timings[iterations / 2 - 1] + timings[iterations / 2]) / 2
        : timings[Math.floor(iterations / 2)];
    const minTimeMs = timings[0];
    const maxTimeMs = timings[iterations - 1];
    const operationsPerSecond = 1000 / averageTimeMs;

    return {
        name,
        strategy: sortingOptions.strategy,
        inputSize: properties.length,
        iterations,
        totalTimeMs,
        averageTimeMs,
        medianTimeMs,
        minTimeMs,
        maxTimeMs,
        operationsPerSecond,
        timestamp: new Date().toISOString()
    };
}

/**
 * Save benchmark results to a JSON file
 */
export function saveBenchmarkResults(results: BenchmarkResult[], filename: string): void {
    const resultsDir = path.join(__dirname, '..', 'results');

    // Create results directory if it doesn't exist
    if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
    }

    const filePath = path.join(resultsDir, `${filename}.json`);

    // Check if file exists and append results or create new file
    let existingResults: BenchmarkResult[] = [];

    if (fs.existsSync(filePath)) {
        try {
            existingResults = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (error) {
            console.error(`Error reading existing results file: ${error}`);
        }
    }

    const allResults = [...existingResults, ...results];

    fs.writeFileSync(filePath, JSON.stringify(allResults, null, 2), 'utf-8');
    console.log(`Benchmark results saved to ${filePath}`);
}
