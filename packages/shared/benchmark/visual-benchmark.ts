import { sortProperties, hashMapSort, radixSortProperties } from '../src/sorting';
import { DEFAULT_PROPERTY_GROUPS } from '../src/property-groups';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Generate chart data for visualizing algorithm performance
 */
export function generateBenchmarkChart(results: any[]) {
    const sizes = [...new Set(results.map(r => r.inputSize))].sort((a, b) => a - b);
    const algorithms = [...new Set(results.map(r => r.algorithm))];

    const datasets = algorithms.map((alg, index) => {
        const algResults = results.filter(r => r.algorithm === alg);
        const color = getColor(index);

        return {
            label: alg,
            data: sizes.map(size => {
                const result = algResults.find(r => r.inputSize === size);
                return result ? result.medianTime : 0;
            }),
            borderColor: color,
            backgroundColor: color + '44' // Add transparency
        };
    });

    const chartConfig = {
        type: 'line',
        data: {
            labels: sizes.map(s => s.toString()),
            datasets
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'CSS Property Sorting Algorithm Performance'
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Input Size (number of properties)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Time (milliseconds)'
                    }
                }
            }
        }
    };

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSS Property Sorting Benchmark</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 2rem; }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { text-align: center; }
    .chart-container { height: 400px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>CSS Property Sorting Algorithm Benchmark</h1>
    <div class="chart-container">
      <canvas id="benchmarkChart"></canvas>
    </div>
    <div id="tableContainer"></div>
  </div>
  <script>
    const config = ${JSON.stringify(chartConfig)};
    const ctx = document.getElementById('benchmarkChart');
    new Chart(ctx, config);
    
    // Create tables for each input size
    const results = ${JSON.stringify(results)};
    const sizes = [...new Set(results.map(r => r.inputSize))].sort((a, b) => a - b);
    let tableHtml = '';
    
    for (const size of sizes) {
      const sizeResults = results
        .filter(r => r.inputSize === size)
        .sort((a, b) => a.medianTime - b.medianTime);
      
      tableHtml += \`<h2>Input Size: \${size} properties</h2>\`;
      tableHtml += '<table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%;">';
      tableHtml += '<thead><tr><th>Algorithm</th><th>Average Time (ms)</th><th>Median Time (ms)</th><th>Min Time (ms)</th><th>Max Time (ms)</th></tr></thead>';
      tableHtml += '<tbody>';
      
      for (const result of sizeResults) {
        tableHtml += \`<tr>
          <td>\${result.algorithm}</td>
          <td>\${result.averageTime.toFixed(3)}</td>
          <td>\${result.medianTime.toFixed(3)}</td>
          <td>\${result.minTime.toFixed(3)}</td>
          <td>\${result.maxTime.toFixed(3)}</td>
        </tr>\`;
      }
      
      tableHtml += '</tbody></table><br>';
    }
    
    document.getElementById('tableContainer').innerHTML = tableHtml;
  </script>
</body>
</html>
  `;

    const outputPath = path.join(__dirname, '../../../benchmark-results.html');
    fs.writeFileSync(outputPath, htmlTemplate, 'utf-8');
    console.log(`Visual benchmark results saved to: ${outputPath}`);

    return outputPath;
}

function getColor(index: number) {
    const colors = [
        '#ff6384', '#36a2eb', '#ffce56', '#4bc0c0',
        '#9966ff', '#ff9f40', '#c9cbcf', '#7cbb5e'
    ];
    return colors[index % colors.length];
}

// Update run-benchmark.ts to also generate visual results
export function updateRunBenchmark() {
    const benchmarkPath = path.join(__dirname, 'run-benchmark.ts');
    let content = fs.readFileSync(benchmarkPath, 'utf-8');

    if (!content.includes('generateBenchmarkChart')) {
        content = content.replace(
            'import { runSortingBenchmarks, formatBenchmarkResults } from \'./sorting-benchmark\';',
            'import { runSortingBenchmarks, formatBenchmarkResults } from \'./sorting-benchmark\';\nimport { generateBenchmarkChart } from \'./visual-benchmark\';'
        );

        content = content.replace(
            'console.log(`Benchmark results saved to: ${outputPath}`);',
            'console.log(`Benchmark results saved to: ${outputPath}`);\n\n  // Generate visual chart\n  const chartPath = generateBenchmarkChart(results);\n  console.log(`Visual benchmark results saved to: ${chartPath}`);'
        );

        fs.writeFileSync(benchmarkPath, content, 'utf-8');
    }
}

// Call this when this file is executed directly
if (require.main === module) {
    updateRunBenchmark();
    console.log('Updated run-benchmark.ts to include visual chart generation');
}
