import { describe, it, expect } from 'vitest';
import { sortProperties } from '../utils';
import { SortingOptions, convertCSSCombConfig, CSSCombConfig } from '../types';

describe('Shared utilities', () => {
  describe('sortProperties', () => {
    it('should sort properties alphabetically with the alphabetical strategy', () => {
      const properties = ['width', 'color', 'background', 'display'];
      const options: SortingOptions = {
        strategy: 'alphabetical',
        emptyLinesBetweenGroups: false,
        sortPropertiesWithinGroups: true
      };
      
      const result = sortProperties(properties, options);
      
      expect(result.success).toBe(true);
      expect(result.sortedProperties).toEqual(['background', 'color', 'display', 'width']);
    });
    
    it('should sort properties by groups with the grouped strategy', () => {
      const properties = ['color', 'position', 'width', 'display'];
      const options: SortingOptions = {
        strategy: 'grouped',
        emptyLinesBetweenGroups: false,
        sortPropertiesWithinGroups: false
      };
      
      const result = sortProperties(properties, options);
      
      expect(result.success).toBe(true);
      // Position should come before display, which should come before width, which should come before color
      const positionIndex = result.sortedProperties.indexOf('position');
      const displayIndex = result.sortedProperties.indexOf('display');
      const widthIndex = result.sortedProperties.indexOf('width');
      const colorIndex = result.sortedProperties.indexOf('color');
      
      expect(positionIndex).toBeLessThan(displayIndex);
      expect(displayIndex).toBeLessThan(widthIndex);
      expect(widthIndex).toBeLessThan(colorIndex);
    });
    
    it('should add empty lines between groups when requested', () => {
      const properties = ['color', 'position', 'width', 'display'];
      const options: SortingOptions = {
        strategy: 'grouped',
        emptyLinesBetweenGroups: true,
        sortPropertiesWithinGroups: false
      };
      
      const result = sortProperties(properties, options);
      
      expect(result.success).toBe(true);
      expect(result.sortedProperties.includes('')).toBe(true);
    });
    
    it('should handle concentric sorting', () => {
      const properties = ['color', 'position', 'width', 'display'];
      const options: SortingOptions = {
        strategy: 'concentric',
        emptyLinesBetweenGroups: false,
        sortPropertiesWithinGroups: false
      };
      
      const result = sortProperties(properties, options);
      
      expect(result.success).toBe(true);
      expect(result.sortedProperties.length).toBe(properties.length);
    });
    
    it('should handle custom property groups', () => {
      const properties = ['color', 'position', 'width', 'display'];
      const options: SortingOptions = {
        strategy: 'custom',
        emptyLinesBetweenGroups: false,
        sortPropertiesWithinGroups: false,
        propertyGroups: [
          ['color'],
          ['position'],
          ['width', 'display']
        ]
      };
      
      const result = sortProperties(properties, options);
      
      expect(result.success).toBe(true);
      // Color should come before position, which should come before width and display
      const colorIndex = result.sortedProperties.indexOf('color');
      const positionIndex = result.sortedProperties.indexOf('position');
      const widthIndex = result.sortedProperties.indexOf('width');
      const displayIndex = result.sortedProperties.indexOf('display');
      
      expect(colorIndex).toBeLessThan(positionIndex);
      expect(positionIndex).toBeLessThan(widthIndex);
      expect(positionIndex).toBeLessThan(displayIndex);
    });
    
    it('should return an error for custom strategy without propertyGroups', () => {
      const properties = ['color', 'position', 'width', 'display'];
      const options: SortingOptions = {
        strategy: 'custom',
        emptyLinesBetweenGroups: false,
        sortPropertiesWithinGroups: false
      };
      
      const result = sortProperties(properties, options);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
  
  describe('convertCSSCombConfig', () => {
    it('should convert a CSSComb configuration to Old Fashioned sorting options', () => {
      const csscombConfig: CSSCombConfig = {
        'sort-order': [
          ['position', 'top', 'right', 'bottom', 'left'],
          ['display', 'width', 'height'],
          'color',
          'background'
        ]
      };
      
      const options = convertCSSCombConfig(csscombConfig);
      
      expect(options.strategy).toBe('custom');
      expect(options.propertyGroups).toHaveLength(4);
      expect(options.propertyGroups?.[0]).toEqual(['position', 'top', 'right', 'bottom', 'left']);
      expect(options.propertyGroups?.[2]).toEqual(['color']);
    });
    
    it('should return default options for empty CSSComb config', () => {
      const csscombConfig: CSSCombConfig = {};
      
      const options = convertCSSCombConfig(csscombConfig);
      
      expect(options.strategy).toBe('grouped');
      expect(options.emptyLinesBetweenGroups).toBe(true);
      expect(options.sortPropertiesWithinGroups).toBe(true);
    });
  });
});
