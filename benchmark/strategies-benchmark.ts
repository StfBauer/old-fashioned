/**
 * Benchmark for comparing different sorting strategies
 */
import {
    smallPropertySet,
    mediumPropertySet,
    largePropertySet,
    bootstrapPropertySet,
    materialUiPropertySet,
    tailwindClassesPropertySet,
    generateRandomCSS,
    propertySetWithVendorPrefixes,
    propertySetWithCustomProperties,
    shuffleArray
} from './fixtures/property-sets';

import {
    runBenchmark,
    saveBenchmarkResults,
    BenchmarkResult
} from './utils/benchmark-runner';

import { generateHtmlReport, saveHtmlReport } from './utils/visualization';
import { SortingOptions } from '../packages/shared/src/types';

// Define strategies to benchmark
const strategies: SortingOptions[] = [
    { strategy: 'alphabetical' },
    { strategy: 'grouped', emptyLinesBetweenGroups: false, sortPropertiesWithinGroups: true },
    { strategy: 'grouped', emptyLinesBetweenGroups: true, sortPropertiesWithinGroups: true },
    { strategy: 'concentric' },
];

// Define property sets to test with
const propertySets = [
    // Standard size-based test sets
    { name: 'small', properties: shuffleArray([...smallPropertySet]) },
    { name: 'medium', properties: shuffleArray([...mediumPropertySet]) },
    { name: 'large', properties: shuffleArray([...largePropertySet]) },

    // Real-world framework test sets
    { name: 'bootstrap', properties: shuffleArray([...bootstrapPropertySet]) },
    { name: 'material-ui', properties: shuffleArray([...materialUiPropertySet]) },
    { name: 'tailwind', properties: shuffleArray([...tailwindClassesPropertySet]) },

    // Randomly generated CSS
    { name: 'random50', properties: generateRandomCSS(50) },

    // Special case test sets
    { name: 'vendor-prefixes', properties: propertySetWithVendorPrefixes },
    { name: 'custom-properties', properties: propertySetWithCustomProperties },
];

/**
 * Run benchmarks for all strategies against all property sets
 */
async function runStrategiesBenchmarks() {
    console.log('Running strategies benchmark...');

    const results: BenchmarkResult[] = [];

    // Determine number of iterations based on property set size
    const getIterations = (size: number) => {
        if (size < 20) return 10000;
        if (size < 50) return 5000;
        return 1000;
    };

    // Run benchmarks for each strategy and property set
    for (const propertySet of propertySets) {
        console.log(`Testing with ${propertySet.name} property set (${propertySet.properties.length} properties)`);

        const iterations = getIterations(propertySet.properties.length);

        for (const options of strategies) {
            // Create a descriptive name for this benchmark
            let name = `${options.strategy}`;
            if (options.strategy === 'grouped') {
                name += options.emptyLinesBetweenGroups ? '-with-empty-lines' : '-no-empty-lines';
            }
            name += `-${propertySet.name}`;

            console.log(`  Running ${name} benchmark...`);

            const result = runBenchmark({
                name,
                properties: propertySet.properties,
                sortingOptions: options,
                iterations,
                warmupIterations: iterations / 10
            });

            results.push(result);

            console.log(`    Complete: Avg time ${result.averageTimeMs.toFixed(4)} ms, ${result.operationsPerSecond.toFixed(2)} ops/sec`);
        }
    }

    // Save the results
    saveBenchmarkResults(results, 'strategies-benchmark');

    console.log('Strategies benchmark completed!');
}

// Run the benchmarks
runStrategiesBenchmarks().catch(console.error);
