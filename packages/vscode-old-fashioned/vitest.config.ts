/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    environment: 'node',
    include: [
      'test/**/*.test.ts',
      'test/**/*.test.js',
      'test/**/*.spec.ts',
      'test/**/*.spec.js'
    ],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/packages/vscode-old-fashioned',
      provider: 'v8',
    },
  },
});