/**
 * Main entry point for running all benchmarks
 */
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Run all benchmarks
 */
async function runBenchmarks() {
    console.log('Running all benchmarks...');

    try {
        // Run strategies benchmark
        console.log('\n--- Running Strategies Benchmark ---');
        await execAsync(`npx ts-node ${path.join(__dirname, 'strategies-benchmark.ts')}`, {
            env: process.env
        });

        // Run property count benchmark
        console.log('\n--- Running Property Count Benchmark ---');
        await execAsync(`npx ts-node ${path.join(__dirname, 'property-count-benchmark.ts')}`, {
            env: process.env
        });

        // Run CSS/SCSS parsing benchmark
        console.log('\n--- Running CSS/SCSS Parsing Benchmark ---');
        await execAsync(`npx ts-node ${path.join(__dirname, 'css-parsing-benchmark.ts')}`, {
            env: process.env
        });

        console.log('\nAll benchmarks completed successfully!');
        console.log('Reports are available in the benchmark/results/reports directory.');
    } catch (error) {
        console.error('Error running benchmarks:', error);
        process.exit(1);
    }
}

// If this script is run directly, run all benchmarks
if (require.main === module) {
    runBenchmarks().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

export { runBenchmarks };
