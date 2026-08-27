import type { Page, Request } from '@playwright/test';

import { isMatch } from 'es-toolkit/compat';

import { getRouteRegexp } from '../utils/helpers';
import type { RequestMethod } from '../utils/constants';

type WaitForRequestOptions = NonNullable<Parameters<Page['waitForRequest']>[1]>;

interface WaitRequestOptions<Body> {
  body?: Body;
  exact?: boolean;
  headers?: Record<string, string>;
  method?: RequestMethod;
  path: RegExp | string;
  query?: Record<string, number | string>;
}

const toLowerKeys = (headers: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value]));

export const waitRequest = <Body>(
  page: Page,
  { path, method, body, headers, query, exact }: WaitRequestOptions<Body>,
  options?: WaitForRequestOptions
): Promise<Request> => {
  const matcher = typeof path === 'string' ? getRouteRegexp(path, { exact }) : path;

  return page.waitForRequest((request) => {
    if (!matcher.test(request.url())) return false;
    if (method !== undefined && request.method() !== method) return false;

    if (body !== undefined && body !== null) {
      try {
        if (!isMatch(request.postDataJSON(), body)) return false;
      } catch {
        return false;
      }
    }

    if (headers !== undefined && !isMatch(request.headers(), toLowerKeys(headers))) return false;

    if (query !== undefined) {
      const params = Object.fromEntries(new URL(request.url()).searchParams);
      if (!isMatch(params, query)) return false;
    }

    return true;
  }, options);
};
