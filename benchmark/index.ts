/**
 * Main entry point for running all benchmarks
 */
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { runStrategiesBenchmarks } from './strategies-benchmark.js';
import { runPropertyCountBenchmarks } from './property-count-benchmark.js';
import { runCssBenchmarks } from './css-parsing-benchmark.js';

// Get proper __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run all benchmarks sequentially with proper error handling
 */
async function runBenchmarks() {
    console.log('================================');
    console.log('🚀 Running all Old-Fashioned benchmarks');
    console.log('================================\n');

    const results = {
        strategies: { success: false, error: null },
        propertyCount: { success: false, error: null },
        cssParsing: { success: false, error: null }
    };

    // Run strategies benchmark
    try {
        console.log('\n=== 📊 Running Strategies Benchmark ===');
        await runStrategiesBenchmarks();
        results.strategies.success = true;
    } catch (error) {
        results.strategies.error = error;
        console.error('❌ Error running strategies benchmark:', error);
    }

    // Run property count benchmark
    try {
        console.log('\n=== 📏 Running Property Count Benchmark ===');
        await runPropertyCountBenchmarks();
        results.propertyCount.success = true;
    } catch (error) {
        results.propertyCount.error = error;
        console.error('❌ Error running property count benchmark:', error);
    }

    // Run CSS/SCSS parsing benchmark
    try {
        console.log('\n=== 🎨 Running CSS/SCSS Parsing Benchmark ===');
        await runCssBenchmarks();
        results.cssParsing.success = true;
    } catch (error) {
        results.cssParsing.error = error;
        console.error('❌ Error running CSS/SCSS parsing benchmark:', error);
    }

    // Print summary of results
    console.log('\n================================');
    console.log('📋 Benchmark Summary:');
    console.log('--------------------------------');
    console.log(`Strategies Benchmark: ${results.strategies.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Property Count Benchmark: ${results.propertyCount.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`CSS/SCSS Parsing Benchmark: ${results.cssParsing.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log('--------------------------------');

    // Overall success/failure
    const allSucceeded = Object.values(results).every(r => r.success);
    console.log(`\nOverall Status: ${allSucceeded ? '✅ ALL BENCHMARKS COMPLETED SUCCESSFULLY' : '⚠️ SOME BENCHMARKS FAILED'}`);
    console.log('Reports are available in the benchmark/results/reports directory.');
    console.log('================================\n');

    // Exit with error code if any benchmark failed
    if (!allSucceeded) {
        process.exitCode = 1;
    }
}

// Run benchmarks if this module is being run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runBenchmarks().catch((err) => {
        console.error('❌ Fatal error running benchmarks:', err);
        process.exit(1);
    });
}

export { runBenchmarks };
