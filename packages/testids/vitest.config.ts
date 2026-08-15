import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': import.meta.dirname
    }
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'vite/**/*.test.ts', 'tests/**/*.test.ts']
  }
});
