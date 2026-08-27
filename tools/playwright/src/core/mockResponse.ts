import type { Page, Route } from '@playwright/test';

import { isPlainObject } from 'es-toolkit';

import { getRouteRegexp } from '../utils/helpers';

type FulfillOptions = NonNullable<Parameters<Route['fulfill']>[0]>;
type RouteOptions = NonNullable<Parameters<Page['route']>[2]>;

interface MockResponseOptions<Body> extends Omit<FulfillOptions, 'body' | 'json' | 'path'> {
  body?: Body;
  path: RegExp | string;
}

const isJsonBody = (body: unknown): boolean => isPlainObject(body) || Array.isArray(body);

export const mockResponse = <Body>(
  page: Page,
  { path, body, contentType, ...fulfill }: MockResponseOptions<Body>,
  options?: RouteOptions
) => {
  const json = isJsonBody(body);
  const resolvedBody = body === undefined ? undefined : json ? JSON.stringify(body) : String(body);

  return page.route(
    typeof path === 'string' ? getRouteRegexp(path) : path,
    (route) =>
      route.fulfill({
        status: 200,
        ...fulfill,
        ...(resolvedBody !== undefined && { body: resolvedBody }),
        contentType: contentType ?? (json ? 'application/json' : undefined)
      }),
    options
  );
};
