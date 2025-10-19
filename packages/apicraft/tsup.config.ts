import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  dts: true,
  entry: ['bin/bin.ts', 'src/index.ts'],
  external: ['typescript', 'fs'],
  format: ['esm'],
  sourcemap: true,
  minify: true,
  target: 'esnext',
  outDir: 'dist'
});
