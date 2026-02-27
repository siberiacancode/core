import type { Config } from 'prettier';

export type Prettier = Config;

export const prettier: Prettier = {
  printWidth: 100,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'none',
  semi: true,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  arrowParens: 'always'
};
