/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/test/**/*.{test,spec}.ts',
      'test/**/*.{test,spec}.ts', // Add this line to include tests in the root test directory
      'test/all-properties.test.ts'
    ],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['**/node_modules/**', '**/test/**']
    },
    reporters: ['verbose'],
    alias: {
      '@old-fashioned/shared': resolve(__dirname, './packages/shared/src')
    }
  }
});
