interface VitestConfig {
  include?: string[];
  globals?: boolean;
  environment?: string;
  coverage?: {
    reporter?: string[];
  };
  outputFile?: string;
}

declare module '@siberiacancode/vitest' {
  export const vitest: VitestConfig;
}
