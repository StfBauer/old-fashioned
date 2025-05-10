import { runCssVariableTests } from './verification.js';

// Define test cases
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

// Run the verification
runCssVariableTests(testCases);
