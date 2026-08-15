import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    clean: true,
    entry: ['bin/bin.ts'],
    outDir: 'dist/bin',
    format: 'es',
    sourcemap: true,
    target: 'esnext'
  },
  {
    clean: true,
    entry: ['src/index.ts', 'vite/index.ts'],
    fixedExtension: true,
    format: 'es',
    outDir: 'dist/esm',
    platform: 'node',
    sourcemap: true,
    target: 'esnext'
  },
  {
    clean: true,
    entry: ['src/index.ts', 'vite/index.ts'],
    fixedExtension: true,
    format: 'cjs',
    outDir: 'dist/cjs',
    outputOptions: {
      exports: 'named'
    },
    platform: 'node',
    sourcemap: true,
    target: 'esnext'
  }
]);
