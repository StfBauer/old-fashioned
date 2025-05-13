# Strategies Benchmark Benchmark Results

_Generated on 5/7/2025, 7:17:38 PM_

## Summary

| Strategy | Avg. Ops/sec (small) | Avg. Ops/sec (large) | Speedup Factor |
|----------|----------------------|----------------------|-----------------|
| alphabetical | 2,075,981.77 | 211,257.76 | 9.83x |
| grouped | 934,060.17 | 103,464.97 | 9.03x |
| concentric | 486,779.7 | 68,225.99 | 7.13x |

## Performance Analysis

### Small (10 properties)

- The **alphabetical** strategy is fastest at 2,075,981.77 operations/second
- The **grouped** strategy runs at 45.0% of the speed (934,060.17 operations/second)
- The **concentric** strategy runs at 23.4% of the speed (486,779.7 operations/second)

### Medium (30 properties)

- The **alphabetical** strategy is fastest at 970,496.72 operations/second
- The **grouped** strategy runs at 51.7% of the speed (501,950.65 operations/second)
- The **concentric** strategy runs at 27.2% of the speed (263,769.68 operations/second)

### Large (75+ properties)

- The **alphabetical** strategy is fastest at 211,257.76 operations/second
- The **grouped** strategy runs at 49.0% of the speed (103,464.97 operations/second)
- The **concentric** strategy runs at 32.3% of the speed (68,225.99 operations/second)

### Prefixes Properties

- The **alphabetical** strategy is fastest at 2,108,671.26 operations/second
- The **grouped** strategy runs at 30.4% of the speed (640,442.08 operations/second)
- The **concentric** strategy runs at 19.4% of the speed (410,070.48 operations/second)

### Properties Properties

- The **alphabetical** strategy is fastest at 3,405,054.38 operations/second
- The **grouped** strategy runs at 33.4% of the speed (1,137,588.23 operations/second)
- The **concentric** strategy runs at 15.1% of the speed (515,275.18 operations/second)

### Bootstrap Framework CSS

- The **alphabetical** strategy is fastest at 1,706,606.65 operations/second
- The **grouped** strategy runs at 36.2% of the speed (617,572.91 operations/second)
- The **concentric** strategy runs at 22.4% of the speed (381,749.89 operations/second)

### Ui Properties

- The **alphabetical** strategy is fastest at 1,204,851.37 operations/second
- The **grouped** strategy runs at 37.6% of the speed (452,940.47 operations/second)
- The **concentric** strategy runs at 23.4% of the speed (281,974.67 operations/second)

### Tailwind CSS Classes

- The **alphabetical** strategy is fastest at 959,796.42 operations/second
- The **grouped** strategy runs at 36.7% of the speed (352,557.98 operations/second)
- The **concentric** strategy runs at 26.3% of the speed (252,150.21 operations/second)

### Random CSS (50 properties)

- The **alphabetical** strategy is fastest at 395,659.64 operations/second
- The **grouped** strategy runs at 43.2% of the speed (170,929.69 operations/second)
- The **concentric** strategy runs at 34.8% of the speed (137,775.28 operations/second)


## Detailed Results

### Small (10 properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0005 | 0.0003 | 0.0002 | 0.8771 | 2,075,981.77 |
| grouped | 0.0011 | 0.0009 | 0.0005 | 0.3490 | 934,060.17 |
| concentric | 0.0021 | 0.0018 | 0.0015 | 0.2351 | 486,779.7 |


### Medium (30 properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0011 | 0.0010 | 0.0007 | 0.0139 | 970,496.72 |
| grouped | 0.0020 | 0.0018 | 0.0012 | 0.2100 | 501,950.65 |
| concentric | 0.0038 | 0.0036 | 0.0028 | 0.1835 | 263,769.68 |


### Large (75+ properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0047 | 0.0046 | 0.0042 | 0.1719 | 211,257.76 |
| grouped | 0.0097 | 0.0092 | 0.0082 | 0.2454 | 103,464.97 |
| concentric | 0.0147 | 0.0142 | 0.0128 | 0.2109 | 68,225.99 |


### Prefixes Properties

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0005 | 0.0004 | 0.0003 | 0.1770 | 2,108,671.26 |
| grouped | 0.0016 | 0.0015 | 0.0012 | 0.1849 | 640,442.08 |
| concentric | 0.0024 | 0.0023 | 0.0020 | 0.2163 | 410,070.48 |


### Properties Properties

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0003 | 0.0003 | 0.0002 | 0.1421 | 3,405,054.38 |
| grouped | 0.0009 | 0.0008 | 0.0006 | 0.1473 | 1,137,588.23 |
| concentric | 0.0019 | 0.0018 | 0.0015 | 0.1745 | 515,275.18 |


### Bootstrap Framework CSS

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0006 | 0.0006 | 0.0005 | 0.1245 | 1,706,606.65 |
| grouped | 0.0016 | 0.0015 | 0.0012 | 0.1519 | 617,572.91 |
| concentric | 0.0026 | 0.0025 | 0.0023 | 0.1263 | 381,749.89 |


### Ui Properties

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0008 | 0.0008 | 0.0007 | 0.1081 | 1,204,851.37 |
| grouped | 0.0022 | 0.0020 | 0.0018 | 0.1386 | 452,940.47 |
| concentric | 0.0036 | 0.0033 | 0.0031 | 0.1846 | 281,974.67 |


### Tailwind CSS Classes

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0010 | 0.0010 | 0.0009 | 0.0017 | 959,796.42 |
| grouped | 0.0028 | 0.0027 | 0.0024 | 0.1392 | 352,557.98 |
| concentric | 0.0040 | 0.0038 | 0.0034 | 0.2419 | 252,150.21 |


### Random CSS (50 properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0025 | 0.0026 | 0.0021 | 0.0080 | 395,659.64 |
| grouped | 0.0059 | 0.0055 | 0.0050 | 0.1891 | 170,929.69 |
| concentric | 0.0073 | 0.0071 | 0.0068 | 0.0540 | 137,775.28 |

## Conclusions

### Overall Performance

Across all tested property set sizes:

1. The **alphabetical** strategy is the overall fastest
2. The **grouped** strategy runs at 37.7% of the speed of the fastest strategy
3. The **concentric** strategy runs at 21.5% of the speed of the fastest strategy

### Scaling Observations

- As property count increases from NaN to NaN (NaNx):

### Recommendations

- Insufficient data to make specific recommendations
