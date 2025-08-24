import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'lcov'],
      exclude: [
        'node_modules',
        'dist',
        '*.config.ts',
        '*.config.js',
        'coverage',
      ],
    },
    testTimeout: 10000,
  },
});