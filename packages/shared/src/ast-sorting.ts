import * as postcss from 'postcss';
import * as scss from 'postcss-scss';

/**
 * Sort CSS properties using Abstract Syntax Tree manipulation
 * More efficient for large stylesheets with complex structures
 */
export function astBasedSorting(cssContent: string, propertyGroups: string[][], options: { syntax: 'css' | 'scss' } = { syntax: 'css' }) {
    // Create property index map for O(1) lookups
    const propertyIndexMap = new Map<string, number>();
    let groupIndex = 0;

    for (const group of propertyGroups) {
        for (const prop of group) {
            propertyIndexMap.set(prop, groupIndex);
        }
        groupIndex++;
    }

    // Parse using appropriate syntax
    const parser = options.syntax === 'scss' ? scss : postcss;
    const ast = parser.parse(cssContent);

    // Walk rules and sort declarations
    ast.walkRules(rule => {
        const declarations = rule.nodes.filter(node => node.type === 'decl');
        const otherNodes = rule.nodes.filter(node => node.type !== 'decl');

        // Sort declarations
        declarations.sort((a: any, b: any) => {
            const propA = a.prop;
            const propB = b.prop;

            const groupA = propertyIndexMap.get(propA) ?? Infinity;
            const groupB = propertyIndexMap.get(propB) ?? Infinity;

            if (groupA !== groupB) return groupA - groupB;

            // If in same group, sort alphabetically
            return propA.localeCompare(propB);
        });

        // Replace nodes
        rule.nodes = [...declarations, ...otherNodes];
    });

    return ast.toString();
}
