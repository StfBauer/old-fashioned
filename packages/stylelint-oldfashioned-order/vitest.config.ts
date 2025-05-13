/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { join } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{ts,js}'],
  },
  resolve: {
    alias: {
      '@old-fashioned/shared': join(__dirname, '../shared/src'),
    },
  },
});