import type { Page, Request } from '@playwright/test';

import { HTTP_METHODS } from '../utils/constants';
import type { RequestMethod } from '../utils/constants';
import { getRouteRegexp } from '../utils/helpers';

// re-exported for backwards compatibility
export { HTTP_METHODS } from '../utils/constants';
export type { RequestMethod } from '../utils/constants';

interface TrackRequestsOptions {
  /** Anchor the string `path` to the start of the URL as well. */
  exact?: boolean;
  methods?: RequestMethod[];
  path: RegExp | string;
}

/**
 * Collects matching requests into a live array that grows as the page makes
 * requests. Read its `length` or contents after the actions under test.
 */
export const trackRequests = (
  page: Page,
  { path, methods = [...HTTP_METHODS], exact }: TrackRequestsOptions
): Request[] => {
  const matcher = typeof path === 'string' ? getRouteRegexp(path, { exact }) : path;

  const sentRequests: Request[] = [];
  page.on('request', (request) => {
    if (!methods.includes(request.method() as RequestMethod)) return;
    if (matcher.test(request.url())) sentRequests.push(request);
  });

  return sentRequests;
};
