import { defineConfig } from 'tsdown';

export default defineConfig([
  {
    clean: true,
    entry: ['bin/bin.ts'],
    outDir: 'dist/bin',
    format: 'es',
    fixedExtension: true,
    sourcemap: true,
    target: 'esnext',
    platform: 'node'
  },
  {
    clean: true,
    entry: ['src/index.ts'],
    fixedExtension: true,
    format: 'es',
    outDir: 'dist/esm',
    platform: 'node',
    dts: true,
    sourcemap: true,
    target: 'esnext'
  },
  {
    clean: true,
    entry: ['src/index.ts'],
    fixedExtension: true,
    format: 'cjs',
    outDir: 'dist/cjs',
    outputOptions: { exports: 'named' },
    platform: 'node',
    dts: true,
    sourcemap: true,
    target: 'esnext'
  }
]);
