import type { RequestConfig } from '@siberiacancode/fetches';

export type FetchesRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<RequestConfig>;
};
