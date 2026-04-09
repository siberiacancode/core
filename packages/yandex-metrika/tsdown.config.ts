import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    clean: true,
    entry: ['src/index.tsx'],
    fixedExtension: true,
    format: 'es',
    outDir: 'dist/esm',
    platform: 'neutral',
    sourcemap: true,
    target: 'esnext'
  },
  {
    clean: true,
    entry: ['src/index.tsx'],
    fixedExtension: true,
    format: 'cjs',
    outDir: 'dist/cjs',
    outputOptions: {
      exports: 'named'
    },
    platform: 'neutral',
    sourcemap: true,
    target: 'esnext'
  }
]);
