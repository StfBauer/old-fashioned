import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    plugins: {
      '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default,
    },
    languageOptions: {
      parser: await import('@typescript-eslint/parser'),
    },
    rules: {
      // Covered by the TypeScript compiler and @typescript-eslint/no-unused-vars
      'no-undef': 'off',
      'no-unused-vars': 'off',
      // TypeScript specific rules
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
    }
  },
  {
    files: ['**/stylelint.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: { module: 'writable' },
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '**/*.test.ts'],
  },
];
