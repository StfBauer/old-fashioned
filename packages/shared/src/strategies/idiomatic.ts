/**
 * Idiomatic sorting strategy based on Nicolas Gallagher's Idiomatic CSS principles
 */
import { SortingOptions, SortingResult } from '../types';
import { IDIOMATIC_PROPERTY_GROUPS } from '../property-groups';
import { optimizedGroupedSort } from './grouped';

/**
 * Sort properties using the idiomatic CSS approach
 * @param properties - The properties to sort
 * @param options - Sorting options
 * @returns The sorting result
 */
export function sortByIdiomatic(properties: string[], options: SortingOptions): SortingResult {
    // Special handling for idiomatic sorting to ensure properties like width and aspect-ratio stay together
    const idiomaticOptions: SortingOptions = {
        ...options,
        sortPropertiesWithinGroups: false // Don't sort within box-sizing group to preserve order
    };

    return optimizedGroupedSort(properties, IDIOMATIC_PROPERTY_GROUPS, idiomaticOptions);
}
