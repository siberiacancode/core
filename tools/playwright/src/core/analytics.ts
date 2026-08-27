import type { Page } from '@playwright/test';

import { isMatch } from 'es-toolkit/compat';

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

export const analytics = {
  events: <Event = Record<string, any>>(page: Page): Promise<Event[]> =>
    page.evaluate(() => window.dataLayer ?? []) as Promise<Event[]>,

  event: <Event = Record<string, any>>(page: Page, index = -1): Promise<Event | undefined> =>
    page.evaluate((at) => window.dataLayer?.at(at), index) as Promise<Event | undefined>,

  find: async <Event = Record<string, any>>(
    page: Page,
    match: Partial<Event>
  ): Promise<Event | undefined> => {
    const events = await page.evaluate(() => window.dataLayer ?? []);
    return [...events].reverse().find((event) => isMatch(event, match)) as Event | undefined;
  }
};
