# Property Count Benchmark Benchmark Results

_Generated on 5/7/2025, 7:17:38 PM_

## Summary

| Strategy | Avg. Ops/sec (small) | Avg. Ops/sec (large) | Speedup Factor |
|----------|----------------------|----------------------|-----------------|
| alphabetical | 2,651,313.14 | 193,561.64 | 13.70x |
| grouped | 1,271,232.28 | 103,246.43 | 12.31x |
| concentric | 519,840.02 | 67,115.26 | 7.75x |

## Performance Analysis

### Properties Properties

- The **alphabetical** strategy is fastest at 1,218,982.97 operations/second
- The **grouped** strategy runs at 57.9% of the speed (705,529.7 operations/second)
- The **concentric** strategy runs at 22.9% of the speed (278,847.41 operations/second)

### Tiny (5 properties)

- The **alphabetical** strategy is fastest at 1,831,456.05 operations/second
- The **grouped** strategy runs at 76.7% of the speed (1,404,699.67 operations/second)
- The **concentric** strategy runs at 31.4% of the speed (575,964.17 operations/second)

### Small (10 properties)

- The **alphabetical** strategy is fastest at 2,651,313.14 operations/second
- The **grouped** strategy runs at 47.9% of the speed (1,271,232.28 operations/second)
- The **concentric** strategy runs at 19.6% of the speed (519,840.02 operations/second)

### Medium (30 properties)

- The **alphabetical** strategy is fastest at 812,227 operations/second
- The **grouped** strategy runs at 59.7% of the speed (484,654.18 operations/second)
- The **concentric** strategy runs at 29.3% of the speed (238,043.42 operations/second)

### Large (75+ properties)

- The **alphabetical** strategy is fastest at 193,561.64 operations/second
- The **grouped** strategy runs at 53.3% of the speed (103,246.43 operations/second)
- The **concentric** strategy runs at 34.7% of the speed (67,115.26 operations/second)


## Detailed Results

### Properties Properties

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0019 | 0.0018 | 0.0001 | 1.2822 | 1,218,982.97 |
| grouped | 0.0033 | 0.0031 | 0.0004 | 0.2579 | 705,529.7 |
| concentric | 0.0062 | 0.0058 | 0.0013 | 0.2442 | 278,847.41 |


### Tiny (5 properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0005 | 0.0002 | 0.0001 | 2.3763 | 1,831,456.05 |
| grouped | 0.0007 | 0.0006 | 0.0005 | 0.2058 | 1,404,699.67 |
| concentric | 0.0017 | 0.0015 | 0.0013 | 0.1804 | 575,964.17 |


### Small (10 properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0004 | 0.0003 | 0.0002 | 0.1699 | 2,651,313.14 |
| grouped | 0.0008 | 0.0007 | 0.0006 | 0.1604 | 1,271,232.28 |
| concentric | 0.0019 | 0.0018 | 0.0016 | 0.1283 | 519,840.02 |


### Medium (30 properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0012 | 0.0011 | 0.0010 | 0.0488 | 812,227 |
| grouped | 0.0021 | 0.0019 | 0.0017 | 0.1995 | 484,654.18 |
| concentric | 0.0042 | 0.0039 | 0.0036 | 0.1683 | 238,043.42 |


### Large (75+ properties)

| Strategy | Avg Time (ms) | Median Time (ms) | Min Time (ms) | Max Time (ms) | Ops/sec |
|----------|---------------|-----------------|--------------|--------------|--------|
| alphabetical | 0.0052 | 0.0049 | 0.0047 | 0.1993 | 193,561.64 |
| grouped | 0.0097 | 0.0091 | 0.0088 | 0.1693 | 103,246.43 |
| concentric | 0.0149 | 0.0141 | 0.0127 | 0.1847 | 67,115.26 |

## Conclusions

### Overall Performance

Across all tested property set sizes:

1. The **alphabetical** strategy is the overall fastest
2. The **grouped** strategy runs at 59.2% of the speed of the fastest strategy
3. The **concentric** strategy runs at 25.0% of the speed of the fastest strategy

### Scaling Observations

- As property count increases from NaN to NaN (NaNx):

### Recommendations

- Insufficient data to make specific recommendations
