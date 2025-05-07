import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': import('@typescript-eslint/eslint-plugin'),
    },
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    }
  },
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.test.ts'],
  },
];
