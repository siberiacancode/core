import { defineConfig } from 'oxfmt';

import { oxfmt } from './src/index.ts';

export default defineConfig({
  ...oxfmt,
  ignorePatterns: ['dist']
});
