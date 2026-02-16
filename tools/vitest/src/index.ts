import type { InlineConfig as Vitest } from 'vitest/node';

export const vitest: Vitest = {
  globals: true,
  environment: 'jsdom',
  clearMocks: true,
  restoreMocks: true,
  mockReset: true
};

export default vitest;
