import type { BrowserContext, Cookie, Page } from '@playwright/test';

type AddCookie = Parameters<BrowserContext['addCookies']>[0][number];

export const cookie = {
  getItem: async (page: Page, key: string): Promise<string | undefined> => {
    const cookies = await page.context().cookies();
    return cookies.find((cookie) => cookie.name === key)?.value;
  },

  getAll: (page: Page): Promise<Cookie[]> => page.context().cookies(),

  setItem: (
    page: Page,
    key: string,
    value: string,
    options: Omit<AddCookie, 'name' | 'value'> = {}
  ): Promise<void> => {
    const hasTarget = 'url' in options || 'domain' in options;
    return page
      .context()
      .addCookies([{ name: key, value, ...(hasTarget ? {} : { url: page.url() }), ...options }]);
  },

  removeItem: (page: Page, key: string): Promise<void> =>
    page.context().clearCookies({ name: key }),

  clear: (page: Page): Promise<void> => page.context().clearCookies()
};
