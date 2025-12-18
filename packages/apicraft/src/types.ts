import type { RequestConfig } from '@siberiacancode/fetches';
import type { AxiosRequestConfig } from 'axios';

export type FetchesRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<RequestConfig>;
};

export type AxiosRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<AxiosRequestConfig>;
};
