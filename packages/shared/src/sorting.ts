/**
 * Main sorting module that re-exports functionality from the refactored modules
 * This file maintains backward compatibility with existing code
 */
export {
    sortProperties,
    sortPropertiesWithCache,
    adaptiveSortProperties
} from './core-sorting';

// Re-export some strategy functions for backward compatibility
export {
    sortAlphabetically,
    optimizedAlphabeticalSort
} from './strategies/alphabetical';

export {
    sortByGroups,
    optimizedGroupedSort
} from './strategies/grouped';

export {
    sortByConcentricOrder,
    optimizedConcentricSort
} from './strategies/concentric';

export { sortByIdiomatic } from './strategies/idiomatic';

// Re-export utilities
export { processNestedRules } from './nested-rules';
export { extractAndSortCssVariables, mergeCssVariablesWithProperties } from './css-variables';

// No need to re-export caching internals, but we'll re-export the cache itself for testing
export { propertyCache } from './caching';
