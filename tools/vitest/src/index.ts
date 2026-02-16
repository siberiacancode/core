import type { InlineConfig } from 'vitest/node';

export type Vitest = InlineConfig;

export const vitest: Vitest = {
  globals: true,
  environment: 'jsdom',
  clearMocks: true,
  restoreMocks: true,
  mockReset: true
};
