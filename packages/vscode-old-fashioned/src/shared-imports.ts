/**
 * This file provides direct imports from local workspace packages
 * to ensure webpack bundles the code correctly.
 */

// Re-export from @old-fashioned/shared
export {
    sortProperties,
    adaptiveSortProperties,
    sortPropertiesWithCache,
    DEFAULT_PROPERTY_GROUPS,
    CONCENTRIC_PROPERTY_ORDER,
    IDIOMATIC_PROPERTY_GROUPS
} from '../../shared/src/index'; // Adjusted path

export type {
    SortingOptions,
    SortingResult,
    SortingStrategy
} from '../../shared/src/types'; // Adjusted path

// Re-export from stylelint-oldfashioned-order
// Assuming the main export is the rule itself and ruleName
export {
    default as oldFashionedOrderRule,
    ruleName as oldFashionedOrderRuleName
} from '../../stylelint-oldfashioned-order/src/rules/oldfashioned-order'; // Adjusted path
