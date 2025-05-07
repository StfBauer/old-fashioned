import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { DEFAULT_PROPERTY_GROUPS } from '../property-groups';

/**
 * Interface for CSS property metadata
 */
interface CssPropertyMetadata {
    name: string;
    status: 'standard' | 'experimental' | 'deprecated';
    category?: string;
}

/**
 * Fetch latest CSS properties from known-css-properties npm package
 */
async function getLatestCssProperties(): Promise<string[]> {
    try {
        // First try to use known-css-properties if available
        try {
            const knownCssProperties = require('known-css-properties');
            return knownCssProperties.all;
        } catch (err) {
            console.log('known-css-properties package not found, falling back to local list');
            return [];
        }
    } catch (error) {
        console.error('Error fetching CSS properties:', error);
        return [];
    }
}

/**
 * Get properties that exist in known list but aren't in our groups
 */
export async function findMissingProperties(): Promise<string[]> {
    const latestProperties = await getLatestCssProperties();
    if (latestProperties.length === 0) return [];

    // Create a flattened set of all our current properties
    const currentProperties = new Set<string>();
    for (const group of DEFAULT_PROPERTY_GROUPS) {
        for (const prop of group) {
            currentProperties.add(prop);
        }
    }

    // Find properties that are in the latest list but not in our set
    return latestProperties.filter(prop => !currentProperties.has(prop));
}

/**
 * Suggests category assignments for missing properties based on naming patterns
 */
function suggestCategoriesForProperties(properties: string[]): Map<string, string[]> {
    const categoryMap = new Map<string, string[]>();

    const categoryPatterns: Record<string, RegExp[]> = {
        'Positioning': [/^(position|top|right|bottom|left|z-index|inset)/],
        'Box Model': [/^(display|float|clear|box-sizing|width|height|margin|padding)/],
        'Flexbox': [/^flex/, /^(justify-content|align-items|align-content|align-self|gap)/],
        'Grid': [/^grid/],
        'Typography': [/^(font|text|letter|word|line|white-space|hyphens)/],
        'Visual': [/^(color|background|border|outline|opacity|visibility)/],
        'Animation': [/^(animation|transition|transform)/]
    };

    // Initialize category groups
    Object.keys(categoryPatterns).forEach(category => {
        categoryMap.set(category, []);
    });
    categoryMap.set('Other', []);

    // Categorize each property
    for (const prop of properties) {
        let matched = false;
        for (const [category, patterns] of Object.entries(categoryPatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(prop)) {
                    categoryMap.get(category)!.push(prop);
                    matched = true;
                    break;
                }
            }
            if (matched) break;
        }

        if (!matched) {
            categoryMap.get('Other')!.push(prop);
        }
    }

    return categoryMap;
}

/**
 * Generate a report of missing properties and suggested categories
 */
export async function generateMissingPropertiesReport(): Promise<string> {
    const missingProps = await findMissingProperties();

    if (missingProps.length === 0) {
        return 'No missing properties found. Your property groups are up to date!';
    }

    const suggestedCategories = suggestCategoriesForProperties(missingProps);
    let report = `# Missing CSS Properties Report\n\n`;
    report += `Found ${missingProps.length} properties not included in your groups.\n\n`;

    for (const [category, props] of suggestedCategories.entries()) {
        if (props.length === 0) continue;

        report += `## ${category}\n\n`;
        for (const prop of props) {
            report += `- \`${prop}\`\n`;
        }
        report += '\n';
    }

    return report;
}

/**
 * Run the check and print the report
 */
if (require.main === module) {
    (async () => {
        const report = await generateMissingPropertiesReport();
        console.log(report);

        // Save report to file
        const outputPath = path.join(__dirname, '../../../../css-properties-report.md');
        fs.writeFileSync(outputPath, report, 'utf8');
        console.log(`Report saved to: ${outputPath}`);
    })();
}
