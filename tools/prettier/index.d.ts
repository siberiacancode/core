declare module '@siberiacancode/prettier' {
  import type { Config } from 'prettier';

  declare type Prettier = Config;
  export const prettier: Prettier;
}
