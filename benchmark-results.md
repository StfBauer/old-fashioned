# CSS Property Sorting Algorithm Comprehensive Benchmark

## Size: 10 properties

| Strategy | Algorithm | Average (ms) | Median (ms) | Min (ms) | Max (ms) |
|----------|-----------|-------------|------------|---------|----------|
| alphabetical | standard | 0.011 | 0.001 | 0.001 | 0.048 |
| idiomatic-order | standard | 0.004 | 0.004 | 0.003 | 0.006 |
| concentric | standard | 0.025 | 0.005 | 0.004 | 0.102 |
| grouped | standard | 0.022 | 0.006 | 0.004 | 0.087 |
| idiomatic-order | hashmap | 0.008 | 0.007 | 0.007 | 0.008 |
| rational-order | hashmap | 0.008 | 0.007 | 0.007 | 0.010 |
| rational-order | standard | 0.018 | 0.008 | 0.004 | 0.060 |
| grouped | hashmap | 0.009 | 0.008 | 0.007 | 0.013 |
| alphabetical | hashmap | 0.041 | 0.019 | 0.019 | 0.093 |
| concentric | hashmap | 0.023 | 0.020 | 0.017 | 0.040 |
| alphabetical | radix | 0.052 | 0.038 | 0.037 | 0.097 |

## Size: 100 properties

| Strategy | Algorithm | Average (ms) | Median (ms) | Min (ms) | Max (ms) |
|----------|-----------|-------------|------------|---------|----------|
| idiomatic-order | hashmap | 0.016 | 0.017 | 0.014 | 0.017 |
| rational-order | hashmap | 0.017 | 0.017 | 0.015 | 0.017 |
| idiomatic-order | standard | 0.017 | 0.017 | 0.017 | 0.018 |
| rational-order | standard | 0.019 | 0.018 | 0.015 | 0.023 |
| concentric | hashmap | 0.029 | 0.026 | 0.024 | 0.035 |
| grouped | standard | 0.034 | 0.029 | 0.028 | 0.055 |
| grouped | hashmap | 0.035 | 0.034 | 0.029 | 0.043 |
| concentric | standard | 0.050 | 0.048 | 0.041 | 0.060 |
| alphabetical | hashmap | 0.080 | 0.082 | 0.063 | 0.099 |
| alphabetical | standard | 0.157 | 0.154 | 0.121 | 0.202 |
| alphabetical | radix | 0.163 | 0.161 | 0.151 | 0.180 |

## Size: 500 properties

| Strategy | Algorithm | Average (ms) | Median (ms) | Min (ms) | Max (ms) |
|----------|-----------|-------------|------------|---------|----------|
| rational-order | hashmap | 0.042 | 0.042 | 0.042 | 0.044 |
| idiomatic-order | standard | 0.042 | 0.042 | 0.042 | 0.043 |
| idiomatic-order | hashmap | 0.044 | 0.044 | 0.042 | 0.045 |
| grouped | standard | 0.058 | 0.052 | 0.048 | 0.085 |
| rational-order | standard | 0.074 | 0.053 | 0.043 | 0.144 |
| grouped | hashmap | 0.054 | 0.055 | 0.049 | 0.060 |
| concentric | standard | 0.081 | 0.073 | 0.064 | 0.118 |
| concentric | hashmap | 0.081 | 0.085 | 0.060 | 0.110 |
| alphabetical | hashmap | 0.608 | 0.371 | 0.361 | 1.506 |
| alphabetical | standard | 0.437 | 0.416 | 0.397 | 0.528 |
| alphabetical | radix | 0.574 | 0.576 | 0.551 | 0.593 |

## Size: 1000 properties

| Strategy | Algorithm | Average (ms) | Median (ms) | Min (ms) | Max (ms) |
|----------|-----------|-------------|------------|---------|----------|
| rational-order | hashmap | 0.048 | 0.048 | 0.048 | 0.048 |
| idiomatic-order | standard | 0.048 | 0.048 | 0.048 | 0.049 |
| idiomatic-order | hashmap | 0.048 | 0.048 | 0.048 | 0.049 |
| grouped | hashmap | 0.049 | 0.049 | 0.048 | 0.050 |
| rational-order | standard | 0.053 | 0.051 | 0.050 | 0.058 |
| grouped | standard | 0.057 | 0.054 | 0.049 | 0.073 |
| concentric | hashmap | 0.062 | 0.061 | 0.060 | 0.069 |
| concentric | standard | 0.074 | 0.068 | 0.062 | 0.098 |
| alphabetical | hashmap | 0.915 | 0.768 | 0.725 | 1.568 |
| alphabetical | radix | 0.756 | 0.857 | 0.354 | 1.115 |
| alphabetical | standard | 0.944 | 0.971 | 0.856 | 1.045 |

## Visualization

A visual representation of this data is available in the HTML report.

