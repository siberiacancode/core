import type { Locator, Page, PageAssertionsToHaveScreenshotOptions } from '@playwright/test';

import { expect } from '@playwright/test';

const DEFAULT_VIEWPORT_WIDTH = 420;

interface SnapshotOptions extends PageAssertionsToHaveScreenshotOptions {
  locator?: Locator | string;
}

export const snapshot = async (
  page: Page,
  name: string,
  { locator, animations = 'disabled', ...options }: SnapshotOptions = {}
) => {
  const target = typeof locator === 'string' ? page.locator(locator) : (locator ?? page);
  const width = page.viewportSize()?.width ?? DEFAULT_VIEWPORT_WIDTH;

  await expect(target).toHaveScreenshot([name, `${width}.png`], {
    animations,
    ...options
  });
};
