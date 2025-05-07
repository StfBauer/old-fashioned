/**
 * Utilities for generating Markdown benchmark reports
 */
import * as fs from 'fs';
import * as path from 'path';
import { BenchmarkResult } from './benchmark-runner.js';

/**
 * Generate a Markdown report from benchmark results
 */
export function generateMarkdownReport(results: BenchmarkResult[], title: string): string {
    const groupedBySize = groupResultsByInputSize(results);

    // Create title and header
    let markdown = `# ${title}\n\n`;
    markdown += `_Generated on ${new Date().toLocaleString()}_\n\n`;
    markdown += `## Summary\n\n`;

    // Add summary table
    markdown += generateSummaryTable(groupedBySize);

    // Add performance analysis
    markdown += `\n## Performance Analysis\n\n`;
    markdown += generatePerformanceAnalysis(groupedBySize);

    // Generate tables for each input size
    markdown += `\n## Detailed Results\n\n`;
    markdown += Object.entries(groupedBySize)
        .map(([size, results]) => generateDetailedResultsTable(size, results))
        .join('\n\n');

    // Add conclusions
    markdown += `\n## Conclusions\n\n`;
    markdown += generateConclusions(groupedBySize);

    return markdown;
}

/**
 * Save Markdown report to file
 */
export function saveMarkdownReport(markdown: string, filename: string): void {
    const reportsDir = path.join(__dirname, '..', 'results', 'reports');

    // Create reports directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
    }

    const filePath = path.join(reportsDir, `${filename}.md`);
    fs.writeFileSync(filePath, markdown, 'utf-8');
    console.log(`Markdown report saved to ${filePath}`);
}

/**
 * Generate summary table with high-level metrics
 */
function generateSummaryTable(groupedBySize: Record<string, BenchmarkResult[]>): string {
    // Check if there are any results
    if (Object.keys(groupedBySize).length === 0) {
        return "No benchmark results available for summary.\n\n";
    }

    let table = `| Strategy | Avg. Ops/sec (small) | Avg. Ops/sec (large) | Speedup Factor |\n`;
    table += `|----------|----------------------|----------------------|-----------------|\n`;

    // Get unique strategies
    const strategies = new Set<string>();
    Object.values(groupedBySize).forEach(results => {
        results.forEach(result => strategies.add(result.strategy));
    });

    // For each strategy, calculate metrics
    Array.from(strategies).forEach(strategy => {
        // Find smallest and largest input sizes
        const sizes = Object.keys(groupedBySize).map(String);

        // Default to first and last if small/large not present
        const smallestSize = sizes.includes('small') ? 'small' : sizes[0];
        const largestSize = sizes.includes('large') ? 'large' : sizes[sizes.length - 1];

        // Handle missing sizes
        if (!groupedBySize[smallestSize] || !groupedBySize[largestSize]) {
            table += `| ${strategy} | N/A | N/A | N/A |\n`;
            return;
        }

        // Calculate average ops/sec for smallest size - with null check
        const smallSizeResults = groupedBySize[smallestSize]?.filter(r => r.strategy === strategy) || [];
        const smallSizeAvgOps = smallSizeResults.length > 0
            ? smallSizeResults.reduce((sum, r) => sum + r.operationsPerSecond, 0) / smallSizeResults.length
            : 0;

        // Calculate average ops/sec for largest size - with null check
        const largeSizeResults = groupedBySize[largestSize]?.filter(r => r.strategy === strategy) || [];
        const largeSizeAvgOps = largeSizeResults.length > 0
            ? largeSizeResults.reduce((sum, r) => sum + r.operationsPerSecond, 0) / largeSizeResults.length
            : 0;

        // Calculate speedup factor
        const speedupFactor = smallSizeAvgOps / (largeSizeAvgOps || 1);

        table += `| ${strategy} | ${formatNumber(smallSizeAvgOps)} | ${formatNumber(largeSizeAvgOps)} | ${speedupFactor.toFixed(2)}x |\n`;
    });

    return table;
}

/**
 * Format a size name for display
 */
function formatSizeName(sizeName: string): string {
    // Check if this is a known size category
    const sizeLabels: Record<string, string> = {
        'tiny': 'Tiny (5 properties)',
        'small': 'Small (10 properties)',
        'medium': 'Medium (30 properties)',
        'large': 'Large (75+ properties)',
        'extra-large': 'Extra Large (100 properties)',
        'bootstrap': 'Bootstrap Framework CSS',
        'material-ui': 'Material UI Framework CSS',
        'tailwind': 'Tailwind CSS Classes',
        'random25': 'Random CSS (25 properties)',
        'random50': 'Random CSS (50 properties)',
        'random100': 'Random CSS (100 properties)',
        'vendor-prefixes': 'Vendor Prefixes',
        'custom-properties': 'Custom Properties'
    };

    return sizeLabels[sizeName] || `${sizeName.charAt(0).toUpperCase() + sizeName.slice(1)} Properties`;
}

/**
 * Generate performance analysis text
 */
function generatePerformanceAnalysis(groupedBySize: Record<string, BenchmarkResult[]>): string {
    let analysis = '';

    // Get sizes and order them
    const sizes = Object.keys(groupedBySize);

    // Get unique strategies
    const strategies = new Set<string>();
    Object.values(groupedBySize).forEach(results => {
        results.forEach(result => strategies.add(result.strategy));
    });

    // For each size, determine the fastest strategy
    sizes.forEach(size => {
        const sizeResults = groupedBySize[size];

        // Group by strategy and calculate average
        const strategyPerformance: Record<string, number> = {};
        Array.from(strategies).forEach(strategy => {
            const strategyResults = sizeResults.filter(r => r.strategy === strategy);
            if (strategyResults.length > 0) {
                strategyPerformance[strategy] = strategyResults.reduce((sum, r) => sum + r.operationsPerSecond, 0)
                    / strategyResults.length;
            }
        });

        // Find the fastest strategy
        let fastestStrategy = '';
        let highestOps = 0;

        Object.entries(strategyPerformance).forEach(([strategy, ops]) => {
            if (ops > highestOps) {
                fastestStrategy = strategy;
                highestOps = ops;
            }
        });

        // Calculate relative performance
        const relativePerformance: Record<string, string> = {};
        Object.entries(strategyPerformance).forEach(([strategy, ops]) => {
            const relativePct = (ops / highestOps) * 100;
            relativePerformance[strategy] = `${relativePct.toFixed(1)}%`;
        });

        // Generate analysis for this size
        analysis += `### ${formatSizeName(size)}\n\n`;
        analysis += `- The **${fastestStrategy}** strategy is fastest at ${formatNumber(highestOps)} operations/second\n`;

        Object.entries(relativePerformance)
            .filter(([strategy]) => strategy !== fastestStrategy)
            .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]))
            .forEach(([strategy, relative]) => {
                analysis += `- The **${strategy}** strategy runs at ${relative} of the speed (${formatNumber(strategyPerformance[strategy])} operations/second)\n`;
            });

        analysis += '\n';
    });

    return analysis;
}

/**
 * Generate detailed results table for a specific input size
 */
function generateDetailedResultsTable(size: string, results: BenchmarkResult[]): string {
    let table = `### ${formatSizeName(size)}\n\n`;
    table += `| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |\n`;
    table += `|----------|---------------|-----------------|--------------|--------------|--------|\n`;

    // Group by strategy for averaging
    const strategyGroups: Record<string, BenchmarkResult[]> = {};
    results.forEach(result => {
        if (!strategyGroups[result.strategy]) {
            strategyGroups[result.strategy] = [];
        }
        strategyGroups[result.strategy].push(result);
    });

    // For each strategy, calculate aggregate metrics
    Object.entries(strategyGroups)
        .sort((a, b) => {
            // Sort by average operations/second, descending
            const aOps = a[1].reduce((sum, r) => sum + r.operationsPerSecond, 0) / a[1].length;
            const bOps = b[1].reduce((sum, r) => sum + r.operationsPerSecond, 0) / b[1].length;
            return bOps - aOps;
        })
        .forEach(([strategy, strategyResults]) => {
            // Calculate averages across all runs for this strategy
            const avgTime = strategyResults.reduce((sum, r) => sum + r.averageTimeMs, 0) / strategyResults.length;
            const medianTime = strategyResults.reduce((sum, r) => sum + r.medianTimeMs, 0) / strategyResults.length;
            const minTime = Math.min(...strategyResults.map(r => r.minTimeMs));
            const maxTime = Math.max(...strategyResults.map(r => r.maxTimeMs));
            const opsPerSec = strategyResults.reduce((sum, r) => sum + r.operationsPerSecond, 0) / strategyResults.length;

            table += `| ${strategy} | ${avgTime.toFixed(4)} | ${medianTime.toFixed(4)} | ${minTime.toFixed(4)} | ${maxTime.toFixed(4)} | ${formatNumber(opsPerSec)} |\n`;
        });

    return table;
}

/**
 * Generate conclusions from the benchmark results
 */
function generateConclusions(groupedBySize: Record<string, BenchmarkResult[]>): string {
    let conclusions = '';

    // Get unique strategies
    const strategies = new Set<string>();
    Object.values(groupedBySize).forEach(results => {
        results.forEach(result => strategies.add(result.strategy));
    });

    // Calculate average performance across all sizes
    const overallPerformance: Record<string, number> = {};
    Array.from(strategies).forEach(strategy => {
        let totalOps = 0;
        let count = 0;

        Object.values(groupedBySize).forEach(sizeResults => {
            // Add null check here to fix the error
            const strategyResults = sizeResults?.filter(r => r.strategy === strategy) || [];
            if (strategyResults.length > 0) {
                totalOps += strategyResults.reduce((sum, r) => sum + r.operationsPerSecond, 0) / strategyResults.length;
                count++;
            }
        });

        if (count > 0) {
            overallPerformance[strategy] = totalOps / count;
        }
    });

    // Handle case with no performance data
    if (Object.keys(overallPerformance).length === 0) {
        return "Insufficient data to draw conclusions.\n";
    }

    // Sort strategies by overall performance
    const sortedStrategies = Object.entries(overallPerformance)
        .sort((a, b) => b[1] - a[1])
        .map(([strategy]) => strategy);

    // Generate conclusions
    conclusions += `### Overall Performance\n\n`;
    conclusions += `Across all tested property set sizes:\n\n`;

    if (sortedStrategies.length > 0) {
        conclusions += `1. The **${sortedStrategies[0]}** strategy is the overall fastest\n`;

        for (let i = 1; i < sortedStrategies.length; i++) {
            const relativePct = (overallPerformance[sortedStrategies[i]] / overallPerformance[sortedStrategies[0]]) * 100;
            conclusions += `${i + 1}. The **${sortedStrategies[i]}** strategy runs at ${relativePct.toFixed(1)}% of the speed of the fastest strategy\n`;
        }
    }

    // Add scaling observations
    conclusions += `\n### Scaling Observations\n\n`;

    // Check if we have at least 2 different property counts to analyze scaling
    const sizes = Object.keys(groupedBySize).map(Number).sort((a, b) => a - b);
    if (sizes.length >= 2) {
        const smallestSize = sizes[0];
        const largestSize = sizes[sizes.length - 1];
        const scalingFactor = largestSize / smallestSize;

        conclusions += `- As property count increases from ${smallestSize} to ${largestSize} (${scalingFactor.toFixed(1)}x):\n`;

        sortedStrategies.forEach(strategy => {
            // Add null checks here
            const smallSizeStr = smallestSize.toString();
            const largeSizeStr = largestSize.toString();

            const smallResults = groupedBySize[smallSizeStr]?.filter(r => r.strategy === strategy) || [];
            const largeResults = groupedBySize[largeSizeStr]?.filter(r => r.strategy === strategy) || [];

            if (smallResults.length > 0 && largeResults.length > 0) {
                const smallOps = smallResults.reduce((sum, r) => sum + r.operationsPerSecond, 0) / smallResults.length;
                const largeOps = largeResults.reduce((sum, r) => sum + r.operationsPerSecond, 0) / largeResults.length;
                const performanceDropFactor = smallOps / largeOps;

                conclusions += `  - The **${strategy}** strategy slows down by ${performanceDropFactor.toFixed(1)}x\n`;
            }
        });
    } else {
        conclusions += `- Insufficient data to analyze scaling across different property counts\n`;
    }

    // Add recommendations
    conclusions += `\n### Recommendations\n\n`;

    // Get the fastest for small and large sets with proper null handling
    const smallestResults = groupedBySize[sizes[0]?.toString()] || [];
    const largestResults = groupedBySize[sizes[sizes.length - 1]?.toString()] || [];

    const fastestSmall = findFastestStrategy(smallestResults);
    const fastestLarge = findFastestStrategy(largestResults);

    if (fastestSmall && fastestLarge) {
        conclusions += `- For small property sets (${sizes[0]} properties): Use the **${fastestSmall}** strategy\n`;
        conclusions += `- For large property sets (${sizes[sizes.length - 1]} properties): Use the **${fastestLarge}** strategy\n`;

        if (fastestSmall === fastestLarge) {
            conclusions += `- The **${fastestSmall}** strategy performs best across all tested sizes\n`;
        } else {
            conclusions += `- Consider the trade-off between performance and other factors like readability and maintenance when selecting a strategy\n`;
        }
    } else {
        conclusions += `- Insufficient data to make specific recommendations\n`;
    }

    return conclusions;
}

/**
 * Helper function to group results by input size
 */
function groupResultsByInputSize(results: BenchmarkResult[]): Record<string, BenchmarkResult[]> {
    const grouped: Record<string, BenchmarkResult[]> = {};

    results.forEach(result => {
        // Use the name part after last dash as the size category
        let sizeName;
        if (result.name && result.name.includes('-')) {
            // Extract size part from name (after last dash)
            sizeName = result.name.split('-').pop()!;
        } else {
            // Fallback to input size as a string
            sizeName = result.inputSize?.toString() || 'unknown';
        }

        if (!grouped[sizeName]) {
            grouped[sizeName] = [];
        }
        grouped[sizeName].push(result);
    });

    return grouped;
}

/**
 * Helper to find the fastest strategy in a set of results
 */
function findFastestStrategy(results: BenchmarkResult[]): string | null {
    if (!results || results.length === 0) {
        return null;
    }

    const strategyPerformance: Record<string, number> = {};

    // Group by strategy
    results.forEach(result => {
        if (!strategyPerformance[result.strategy]) {
            strategyPerformance[result.strategy] = 0;
            strategyPerformance[`${result.strategy}_count`] = 0;
        }

        strategyPerformance[result.strategy] += result.operationsPerSecond;
        strategyPerformance[`${result.strategy}_count`]++;
    });

    // Calculate averages
    let fastestStrategy = '';
    let highestOps = 0;

    Object.keys(strategyPerformance).forEach(key => {
        if (!key.endsWith('_count')) {
            const count = strategyPerformance[`${key}_count`];
            if (count > 0) {
                const avg = strategyPerformance[key] / count;
                if (avg > highestOps) {
                    highestOps = avg;
                    fastestStrategy = key;
                }
            }
        }
    });

    return fastestStrategy || null;
}

/**
 * Format a number with thousands separators
 */
function formatNumber(num: number): string {
    if (isNaN(num) || num === 0) {
        return 'N/A';
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
