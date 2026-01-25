import fs from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import pkg from './package.json';

const typesDir = path.resolve(__dirname, 'dist/types');
const typesEntry = path.join(typesDir, 'index.d.ts');

const dualTypesPlugin = () => ({
  name: 'dual-types',
  async closeBundle() {
    const typesContent = await fs.readFile(typesEntry, 'utf8');
    await Promise.all([
      fs.writeFile(path.join(typesDir, 'index.d.mts'), typesContent),
      fs.writeFile(path.join(typesDir, 'index.d.cts'), typesContent)
    ]);
    await fs.unlink(typesEntry);
  }
});

export default defineConfig({
  plugins: [
    dts({
      entryRoot: 'src',
      outDir: 'dist/types',
      tsconfigPath: './tsconfig.json'
    }),
    dualTypesPlugin()
  ],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: pkg.name,
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, 'src/index.ts')
      },
      output: [
        {
          format: 'es',
          dir: 'dist/esm',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].mjs'
        },
        {
          format: 'cjs',
          dir: 'dist/cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: '[name].cjs',
          exports: 'named'
        }
      ]
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true
  }
});
