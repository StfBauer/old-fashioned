/**
 * Benchmark runner for CSS property sorting strategies
 */
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';
import { sortProperties } from '../../packages/shared/src/sorting';
import { SortingOptions } from '../../packages/shared/src/types';

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
        sortProperties([...properties], sortingOptions);
    }

    // Run the actual benchmark
    const timings: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        sortProperties([...properties], sortingOptions);
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
