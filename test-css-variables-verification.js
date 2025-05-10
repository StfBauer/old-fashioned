// Test script for CSS variables with empty line
import fs from 'fs';
import path from 'path';

// Import verification from the reorganized test structure
import { runCssVariableTests } from './packages/shared/test/css-variables/verification.js';

// Test properties with CSS variables
const testCases = [
  {
    name: "Basic CSS variables and properties",
    properties: [
      '--primary-color',
      '--secondary-color',
      '--spacing',
      'width',
      'height',
      'margin',
      'color'
    ]
  },
  {
    name: "Edge case with CSS variables mixed with properties",
    properties: [
      'width',
      'height',
      'margin',
      'color',
      '--primary-color',
      '--secondary-color',
      '--spacing'
    ]
  },
  {
    name: "Single CSS variable with properties",
    properties: [
      'width',
      '--single-var',
      'height',
      'color'
    ]
  }
];

// Test with each strategy and empty lines setting
const strategies = ['alphabetical', 'grouped', 'concentric', 'idiomatic'];
const emptyLinesSettings = [true, false];

// Run tests using the centralized verification module
runCssVariableTests(testCases);
