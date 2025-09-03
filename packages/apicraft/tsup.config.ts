import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['bin/bin.ts', 'src/index.ts'],
  format: ['esm'],
  sourcemap: true,
  minify: true,
  external: ['typescript', 'fs'],
  target: 'esnext',
  outDir: 'dist'
});
