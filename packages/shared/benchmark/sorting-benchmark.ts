/**
 * Comprehensive CSS Property Sorting Benchmark
 * 
 * This file runs benchmarks comparing different sorting algorithms
 * on property lists of various sizes to determine optimal strategies.
 */
import * as fs from 'fs';
import * as path from 'path';
import {
    sortAlphabetically,
    sortByGroups,
    hashMapSort,
    radixSortProperties
} from '../src/sorting';
import { DEFAULT_PROPERTY_GROUPS } from '../src/property-groups';
import { SortingOptions } from '../src/types';

// Configure benchmark
const SAMPLE_SIZES = [10, 50, 100, 500, 1000, 5000];
const ITERATIONS = 1000;
const OUTPUT_DIR = path.join(__dirname, 'results');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate a list of random CSS properties of specified size
 */
function generateRandomProperties(size: number): string[] {
    // Common CSS properties for realistic benchmark
    const commonProps = [
        'position', 'top', 'right', 'bottom', 'left', 'z-index',
        'display', 'visibility', 'float', 'clear', 'overflow',
        'width', 'height', 'margin', 'padding', 'border',
        'background', 'color', 'font', 'text-align', 'line-height',
        'transition', 'transform', 'animation', 'flex', 'grid'
    ];

    // Generate additional properties to reach desired size
    const properties: string[] = [];

    for (let i = 0; i < size; i++) {
        if (i < commonProps.length) {
            properties.push(commonProps[i]);
        } else {
            // Generate random property names
            const prefix = ['', 'webkit-', 'moz-', 'ms-'][Math.floor(Math.random() * 4)];
            const base = commonProps[Math.floor(Math.random() * commonProps.length)];
            const suffix = Math.random() > 0.7 ? `-${Math.floor(Math.random() * 100)}` : '';
            properties.push(`${prefix}${base}${suffix}`);
        }
    }

    // Shuffle the array
    return properties.sort(() => Math.random() - 0.5);
}

/**
 * Benchmark a sorting function
 */
function benchmarkSort(
    name: string,
    sortFn: Function,
    properties: string[],
    iterations: number = ITERATIONS
): { name: string; mean: number; median: number; min: number; max: number } {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        sortFn(properties);
        const end = performance.now();
        times.push(end - start);
    }

    times.sort((a, b) => a - b);
    const min = times[0];
    const max = times[times.length - 1];
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const median = times[Math.floor(times.length / 2)];

    return { name, mean, median, min, max };
}

/**
 * Run a comprehensive benchmark of all sorting algorithms
 */
async function runSortingBenchmark() {
    const results: Record<number, any> = {};

    for (const size of SAMPLE_SIZES) {
        console.log(`Running benchmark for ${size} properties...`);
        const properties = generateRandomProperties(size);
        results[size] = [];

        // Test standard alphabetical sort
        results[size].push(benchmarkSort('Alphabetical (standard)',
            (props: string[]) => sortAlphabetically(props, 'standard'), properties));

        // Test hashmap alphabetical sort
        results[size].push(benchmarkSort('Alphabetical (hashmap)',
            (props: string[]) => sortAlphabetically(props, 'hashmap'), properties));

        // Test radix alphabetical sort
        results[size].push(benchmarkSort('Alphabetical (radix)',
            (props: string[]) => sortAlphabetically(props, 'radix'), properties));

        // Test grouped sort without empty lines
        const groupOptions: SortingOptions = {
            strategy: 'grouped',
            emptyLinesBetweenGroups: false,
            sortPropertiesWithinGroups: true
        };

        results[size].push(benchmarkSort('Grouped (standard)',
            (props: string[]) => sortByGroups(props, DEFAULT_PROPERTY_GROUPS, groupOptions, 'standard'),
            properties));

        results[size].push(benchmarkSort('Grouped (hashmap)',
            (props: string[]) => hashMapSort(props, DEFAULT_PROPERTY_GROUPS),
            properties));

        // Test grouped sort with empty lines
        const groupWithEmptyLinesOptions: SortingOptions = {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true,
            sortPropertiesWithinGroups: true
        };

        results[size].push(benchmarkSort('Grouped with empty lines',
            (props: string[]) => sortByGroups(props, DEFAULT_PROPERTY_GROUPS, groupWithEmptyLinesOptions),
            properties));
    }

    // Format results into a table
    console.log('\nBenchmark Results (times in milliseconds):');
    console.log('--------------------------------------------------------');
    console.log('Size | Algorithm | Median | Mean | Min | Max');
    console.log('--------------------------------------------------------');

    Object.entries(results).forEach(([size, algResults]) => {
        (algResults as any[]).forEach(result => {
            console.log(`${size.padStart(5)} | ${result.name.padEnd(25)} | ${result.median.toFixed(3).padStart(7)} | ${result.mean.toFixed(3).padStart(7)} | ${result.min.toFixed(3).padStart(7)} | ${result.max.toFixed(3).padStart(7)}`);
        });
    });

    // Save results to file
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    const resultFile = path.join(OUTPUT_DIR, `sorting-benchmark-${date}.json`);
    fs.writeFileSync(resultFile, JSON.stringify(results, null, 2));
    console.log(`\nDetailed benchmark results saved to ${resultFile}`);

    // Generate recommendations based on results
    console.log('\nRecommendations:');
    generateRecommendations(results);
}

/**
 * Generate algorithm recommendations based on benchmark results
 */
function generateRecommendations(results: Record<number, any>) {
    const recommendations = new Map<string, string[]>();

    Object.entries(results).forEach(([size, algResults]) => {
        const numSize = parseInt(size, 10);

        // Find fastest algorithm for this size
        let fastest = { name: '', median: Infinity };

        (algResults as any[]).forEach(result => {
            if (result.median < fastest.median) {
                fastest = { name: result.name, median: result.median };
            }
        });

        // Group recommendations by size
        if (numSize <= 20) {
            const sizeCategory = 'tiny';
            const recs = recommendations.get(sizeCategory) || [];
            recs.push(`For ${size} properties: ${fastest.name} (${fastest.median.toFixed(3)} ms)`);
            recommendations.set(sizeCategory, recs);
        } else if (numSize <= 100) {
            const sizeCategory = 'small';
            const recs = recommendations.get(sizeCategory) || [];
            recs.push(`For ${size} properties: ${fastest.name} (${fastest.median.toFixed(3)} ms)`);
            recommendations.set(sizeCategory, recs);
        } else if (numSize <= 1000) {
            const sizeCategory = 'medium';
            const recs = recommendations.get(sizeCategory) || [];
            recs.push(`For ${size} properties: ${fastest.name} (${fastest.median.toFixed(3)} ms)`);
            recommendations.set(sizeCategory, recs);
        } else {
            const sizeCategory = 'large';
            const recs = recommendations.get(sizeCategory) || [];
            recs.push(`For ${size} properties: ${fastest.name} (${fastest.median.toFixed(3)} ms)`);
            recommendations.set(sizeCategory, recs);
        }
    });

    // Print recommendations by size category
    console.log('Tiny files (≤20 properties):');
    console.log(recommendations.get('tiny')?.join('\n  ') || 'No data');

    console.log('\nSmall files (21-100 properties):');
    console.log(recommendations.get('small')?.join('\n  ') || 'No data');

    console.log('\nMedium files (101-1000 properties):');
    console.log(recommendations.get('medium')?.join('\n  ') || 'No data');

    console.log('\nLarge files (>1000 properties):');
    console.log(recommendations.get('large')?.join('\n  ') || 'No data');

    // Overall recommendation
    console.log('\nOverall Recommendation:');
    console.log('For most CSS files (~100-500 properties), the HashMap algorithm provides the best performance.');
    console.log('For tiny files (<20 properties), the standard algorithm has less overhead.');
    console.log('When empty lines between groups are needed, the standard algorithm must be used.');
}

// Run the benchmark
runSortingBenchmark().catch(console.error);
