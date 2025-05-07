/**
 * Trie node for organizing CSS properties
 */
class PropertyTrieNode {
    children: Map<string, PropertyTrieNode> = new Map();
    isEndOfProperty: boolean = false;
    order: number = 0;
}

/**
 * Build a property trie for efficient prefix-based organization
 */
export class PropertyTrie {
    root = new PropertyTrieNode();

    constructor(propertyGroups: string[][]) {
        let order = 0;
        for (const group of propertyGroups) {
            for (const prop of group) {
                this.insert(prop, order++);
            }
        }
    }

    insert(property: string, order: number): void {
        let node = this.root;
        for (const char of property) {
            if (!node.children.has(char)) {
                node.children.set(char, new PropertyTrieNode());
            }
            node = node.children.get(char)!;
        }
        node.isEndOfProperty = true;
        node.order = order;
    }

    getOrder(property: string): number {
        let node = this.root;
        for (const char of property) {
            if (!node.children.has(char)) {
                return Infinity; // Property not found
            }
            node = node.children.get(char)!;
        }
        return node.isEndOfProperty ? node.order : Infinity;
    }

    /**
     * Sort properties using trie lookup
     */
    sortProperties(properties: string[]): string[] {
        return [...properties].sort((a, b) => {
            return this.getOrder(a) - this.getOrder(b);
        });
    }
}
