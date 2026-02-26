import { vitest } from '@siberiacancode/vitest';

export default {
  ...vitest,
  test: {
    ...vitest,
    include: ['src/**/*.test.ts']
  }
};
