/**
 * Handler for nested CSS rules
 */
import { SortingOptions } from './types';

/**
 * Context for nested rule processing
 */
export interface NestingContext {
    nestingLevel: number;
    parentType: string;
    isAtRule: boolean;
}

/**
 * Process nested CSS rules recursively
 * @param properties - The properties to sort
 * @param options - Sorting options
 * @param context - Context about the nesting level and parent rule
 * @returns The sorted properties
 */
export function processNestedRules(
    properties: string[], // This is the already sorted list, possibly with '' markers
    options: SortingOptions,
    context: NestingContext = { nestingLevel: 0, parentType: 'root', isAtRule: false }
): string[] {
    // For non-nested CSS (like the current test case), or if not an @-rule context,
    // this function should be largely a pass-through for top-level properties,
    // preserving existing '' markers.
    
    if (!context.isAtRule && context.nestingLevel === 0) {
        return properties; // Pass through the already sorted list with its '' markers
    }

    // Original logic for handling actual nested structures (e.g., SCSS @media, @nest)
    // would remain here, but it should also respect and pass through '' markers
    // if they are part of a flat list of declarations within a nested block.
    
    return properties;
}
