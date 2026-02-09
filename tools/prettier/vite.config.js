import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import pkg from './package.json';

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: 'dist/types',
      tsconfigPath: './tsconfig.json'
    })
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: pkg.name
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          dir: 'dist/esm',
          entryFileNames: 'index.mjs'
        },
        {
          format: 'cjs',
          dir: 'dist/cjs',
          entryFileNames: 'index.cjs',
          exports: 'named'
        }
      ]
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: false
  }
});
