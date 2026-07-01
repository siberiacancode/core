import type { FetchesRequestOptions, FetchesResponse } from '@siberiacancode/fetches';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { FetchOptions } from 'ofetch';

export type FetchesRequestParams<Params> = Omit<Params, 'url'> & {
  config?: FetchesRequestOptions;
};

export type AxiosRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<AxiosRequestConfig>;
};

export type OfetchRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<FetchOptions>;
};

export type ApicraftAxiosResponse<Data = never, Error = never> = AxiosResponse<Data | Error>;
export type ApicraftFetchesResponse<Data = never, Error = never> = FetchesResponse<Data | Error>;
export type ApicraftOfetchResponse<Data = never, Error = never> = Data | Error;
