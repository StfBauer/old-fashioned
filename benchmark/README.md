# Old Fashioned - Benchmarks

This folder contains benchmarking utilities for the Old Fashioned CSS property sorting toolset.

## Overview

These benchmarks help measure the performance of different sorting strategies and configurations across a range of CSS property sets.

## Running Benchmarks

You can run benchmarks using npm scripts from the project root:

```bash
# Run all benchmarks
npm run benchmark

# Run specific benchmark
npm run benchmark:strategies
npm run benchmark:property-count
```

Or directly using ts-node from the benchmark directory:

```bash
# In the benchmark directory
npx ts-node index.ts
npx ts-node strategies-benchmark.ts
npx ts-node property-count-benchmark.ts
```

## Benchmark Results

Results are saved to the `results` folder in JSON format and can be visualized using:

```bash
npm run benchmark:visualize
```

This generates both HTML and Markdown reports in the `results/reports` directory. If you encounter any issues, you can run the visualization directly:

```bash
npx ts-node benchmark/utils/visualization-cli.ts
```

### Report Types

- **HTML Reports**: Interactive reports with charts for visual analysis
- **Markdown Reports**: Text-based reports suitable for GitHub and documentation

## Available Benchmarks

1. **Strategy Benchmark**: Compares performance of different sorting strategies (alphabetical, grouped, concentric)
2. **Property Count Benchmark**: Measures performance impact of varying property set sizes

## Interpreting Results

The benchmark results provide:

- Average, median, min, and max execution times
- Operations per second
- Comparative charts across different strategies and input sizes
- Performance scaling analysis
- Recommendations for different use cases
