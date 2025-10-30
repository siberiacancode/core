import type { RequestConfig } from '../../fetches/src';

// RETURN AFTER REVIEW

// import type { RequestConfig } from '@siberiacancode/fetches';

export type FetchesRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<RequestConfig>;
};
