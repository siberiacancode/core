import type { BrowserContext, Page } from '@playwright/test';

const serialize = (value: unknown): string =>
  typeof value === 'string' ? value : JSON.stringify(value);

export const localStorage = {
  getItem: (page: Page, key: string): Promise<string | undefined> =>
    page.evaluate((key) => window.localStorage.getItem(key) ?? undefined, key),

  getAll: (page: Page): Promise<Record<string, string>> =>
    page.evaluate(() => ({ ...window.localStorage })),

  setItem: (page: Page, key: string, value: unknown): Promise<void> =>
    page.evaluate(({ key, value }) => window.localStorage.setItem(key, value), {
      key,
      value: serialize(value)
    }),

  removeItem: (page: Page, key: string): Promise<void> =>
    page.evaluate((key) => window.localStorage.removeItem(key), key),

  clear: (page: Page): Promise<void> => page.evaluate(() => window.localStorage.clear()),

  getOriginItem: async (
    context: BrowserContext,
    { origin, key }: { key: string; origin: string }
  ): Promise<string | undefined> => {
    const { origins } = await context.storageState();
    return origins
      .find((info) => info.origin === origin)
      ?.localStorage.find((item) => item.name === key)?.value;
  }
};
