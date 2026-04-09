import { vitest } from '@siberiacancode/vitest';

export default {
  ...vitest,
  test: { testTimeout: 10_000 }
};
