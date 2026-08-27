import type { Page } from '@playwright/test';

// ✅ important:
// React treats click-related events as special "discrete" events. When one hits
// a dehydrated React tree, React can synchronously hydrate it before the click is
// handled. Hover/move events don't get the same sync hydration behavior.
export const waitHydration = (page: Page) =>
  page.locator('body').click({ position: { x: 1, y: 1 } });
