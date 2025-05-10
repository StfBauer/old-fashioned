/**
 * Caching implementation for property sorting
 */
import { SortingResult } from './types';

/**
 * LRU Cache for frequently sorted property sets
 */
export class LRUCache<K, V> {
    private capacity: number;
    private map: Map<K, V>;

    constructor(capacity: number) {
        this.capacity = capacity;
        this.map = new Map();
    }

    get(key: K): V | undefined {
        if (!this.map.has(key)) return undefined;
        const value = this.map.get(key)!;
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }

    set(key: K, value: V): void {
        if (this.map.has(key)) {
            this.map.delete(key);
        } else if (this.map.size >= this.capacity) {
            const oldestKey = this.map.keys().next().value;
            if (oldestKey !== undefined) {
                this.map.delete(oldestKey);
            }
        }
        this.map.set(key, value);
    }

    clear(): void {
        this.map.clear();
    }

    size(): number {
        return this.map.size;
    }
}

// Instantiate a cache for sorted property sets
export const propertyCache = new LRUCache<string, SortingResult>(100);

/**
 * Generate a cache key from properties and options
 */
export function generateCacheKey(properties: string[], strategy: string): string {
    // Simple cache key generation - properties list + strategy
    return `${properties.join(',')}|${strategy}`;
}
