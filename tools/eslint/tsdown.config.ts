import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    clean: true,
    entry: ['src/index.ts'],
    format: 'es',
    outDir: 'dist/esm',
    target: 'esnext'
  },
  {
    clean: true,
    entry: ['src/index.ts'],
    format: 'cjs',
    outDir: 'dist/cjs',
    outputOptions: {
      exports: 'named'
    },
    target: 'esnext'
  }
]);
