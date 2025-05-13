import { describe, it, expect } from 'vitest';
import { sortProperties } from '../src/sorting';

describe('@property CSS at-rule handling', () => {
    it('should identify and preserve @property at-rules', () => {
        const properties = [
            'color',
            'width',
            '@property --my-color {',
            'syntax: <color>;',
            'initial-value: #c0ffee;',
            'inherits: false;',
            '}',
            'height',
            '@property --my-length {',
            'syntax: <length>;',
            'initial-value: 10px;',
            'inherits: true;',
            '}',
            'margin'
        ];

        // We're mainly testing that the sortProperties function doesn't break @property rules
        const result = sortProperties(properties, {
            strategy: 'grouped',
            emptyLinesBetweenGroups: true
        });

        expect(result.success).toBe(true);

        // The @property rules should be preserved
        expect(result.sortedProperties!.includes('@property --my-color {')).toBe(true);
        expect(result.sortedProperties!.includes('syntax: <color>;')).toBe(true);
        expect(result.sortedProperties!.includes('initial-value: #c0ffee;')).toBe(true);
        expect(result.sortedProperties!.includes('inherits: false;')).toBe(true);
        expect(result.sortedProperties!.includes('}')).toBe(true);

        expect(result.sortedProperties!.includes('@property --my-length {')).toBe(true);
        expect(result.sortedProperties!.includes('syntax: <length>;')).toBe(true);
        expect(result.sortedProperties!.includes('initial-value: 10px;')).toBe(true);
        expect(result.sortedProperties!.includes('inherits: true;')).toBe(true);
    });
});
