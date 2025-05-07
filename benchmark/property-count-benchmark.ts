/**
 * Benchmark for testing performance with different property counts
 */
import { shuffleArray, smallPropertySet, mediumPropertySet, largePropertySet } from './fixtures/property-sets.js';
import { runBenchmark, saveBenchmarkResults, BenchmarkResult } from './utils/benchmark-runner.js';
import { generateHtmlReport, saveHtmlReport } from './utils/visualization.js';
import { SortingOptions } from '../packages/shared/src/types.js';
import { fileURLToPath } from 'url';

// Create test sets with consistent property counts
function generatePropertySetsOfVaryingSize() {
    return [
        // Small-sized property sets
        { name: 'tiny', size: 5, properties: shuffleArray([...smallPropertySet.slice(0, 5)]) },
        { name: 'small', size: smallPropertySet.length, properties: shuffleArray([...smallPropertySet]) },

        // Medium-sized property sets
        { name: 'medium', size: mediumPropertySet.length, properties: shuffleArray([...mediumPropertySet]) },

        // Large-sized property sets
        { name: 'large', size: largePropertySet.length, properties: shuffleArray([...largePropertySet]) },
        { name: 'extra-large', size: 100, properties: shuffleArray([...largePropertySet.slice(0, 100)]) }
    ];
}

/**
 * Run benchmarks for different property count sizes
 */
async function runPropertyCountBenchmarks() {
    console.log('Running property count benchmarks...');

    const strategies: SortingOptions[] = [
        { strategy: 'alphabetical' },
        { strategy: 'grouped', emptyLinesBetweenGroups: false, sortPropertiesWithinGroups: true },
        { strategy: 'concentric' }
    ];

    const propertySets = generatePropertySetsOfVaryingSize();
    const results: BenchmarkResult[] = [];

    for (const strategy of strategies) {
        console.log(`Testing with ${strategy.strategy} strategy`);

        for (const propertySet of propertySets) {
            // Adjust iterations based on size to prevent benchmarks from taking too long
            const iterations = propertySet.size < 20 ? 10000 :
                propertySet.size < 50 ? 5000 :
                    propertySet.size < 80 ? 2000 : 1000;

            console.log(`  Testing with ${propertySet.name} set (${propertySet.size} properties, ${iterations} iterations)`);

            const result = runBenchmark({
                name: `${strategy.strategy}-${propertySet.name}`,
                properties: propertySet.properties,
                sortingOptions: strategy,
                iterations,
                warmupIterations: iterations / 10
            });

            results.push(result);

            console.log(`    Complete: Avg time ${result.averageTimeMs.toFixed(4)} ms, ${result.operationsPerSecond.toFixed(2)} ops/sec`);
        }
    }

    // Save the results
    saveBenchmarkResults(results, 'property-count-benchmark');

    // Generate HTML report
    const reportHtml = generateHtmlReport(
        results,
        'CSS Property Count Performance Benchmark Results'
    );
    saveHtmlReport(reportHtml, 'property-count-benchmark');

    console.log('Property count benchmarks completed!');
}

// Export the benchmark function and check for direct execution
export { runPropertyCountBenchmarks };

// More reliable way to detect direct execution in ESM
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runPropertyCountBenchmarks().catch(console.error);
}
