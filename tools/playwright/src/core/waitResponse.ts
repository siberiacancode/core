import type { Page, Response } from '@playwright/test';

import { isMatch } from 'es-toolkit/compat';

import { getRouteRegexp } from '../utils/helpers';
import type { RequestMethod } from '../utils/constants';

type WaitForResponseOptions = NonNullable<Parameters<Page['waitForResponse']>[1]>;

interface WaitResponseOptions<Body> {
  /** Partial match against the JSON response body. */
  body?: Body;
  /** Anchor the string `path` to the start of the URL as well. */
  exact?: boolean;
  method?: RequestMethod;
  path: RegExp | string;
  status?: number;
}

export const waitResponse = <Body>(
  page: Page,
  { path, status, method, body, exact }: WaitResponseOptions<Body>,
  options?: WaitForResponseOptions
): Promise<Response> => {
  const matcher = typeof path === 'string' ? getRouteRegexp(path, { exact }) : path;

  return page.waitForResponse(async (response) => {
    if (!matcher.test(response.url())) return false;
    if (status !== undefined && response.status() !== status) return false;
    if (method !== undefined && response.request().method() !== method) return false;

    if (body !== undefined && body !== null) {
      try {
        if (!isMatch(await response.json(), body)) return false;
      } catch {
        return false;
      }
    }

    return true;
  }, options);
};
