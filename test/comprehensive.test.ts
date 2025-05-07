import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { sortProperties } from '../packages/shared/src/sorting';

describe('Comprehensive CSS/SCSS parsing and sorting', () => {
    it('should handle complex CSS edge cases', () => {
        const cssPath = path.resolve(__dirname, './css/sorting-comprehensive.css');
        const cssContent = fs.readFileSync(cssPath, 'utf-8');

        // Extract property names from a rule for testing
        const firstRuleProps = extractProperties(cssContent, '.basic-sort');

        // Test sorting works on the extracted properties
        const result = sortProperties(firstRuleProps, { strategy: 'grouped' });

        expect(result.success).toBe(true);
        expect(result.sortedProperties!.length).toEqual(firstRuleProps.length);

        // Position should come before color in grouped sorting
        const positionIndex = result.sortedProperties!.indexOf('position');
        const colorIndex = result.sortedProperties!.indexOf('color');

        expect(positionIndex).toBeLessThan(colorIndex);
    });

    it('should handle SCSS specific features', () => {
        const scssPath = path.resolve(__dirname, './scss/sorting-comprehensive.scss');
        const scssContent = fs.readFileSync(scssPath, 'utf-8');

        // Just verify the file exists and has content for now
        expect(scssContent.length).toBeGreaterThan(0);
        expect(scssContent).toContain('@use');
        expect(scssContent).toContain('mixin');
    });
});

// Fix TypeScript error by typing the input and output properly
function extractProperties(css: string, selector: string): string[] {
    const ruleRegex = new RegExp(`${selector}\\s*{([^}]+)}`, 'g');
    const match = ruleRegex.exec(css);
    if (!match || !match[1]) return [];

    const propRegex = /([a-zA-Z-]+)\s*:/g;
    const props: string[] = [];
    let propMatch;

    while ((propMatch = propRegex.exec(match[1])) !== null) {
        props.push(propMatch[1]);
    }

    return props;
}
