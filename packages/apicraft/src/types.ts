import type { FetchesResponse, RequestConfig } from '@siberiacancode/fetches';
import type {
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions
} from '@tanstack/react-query';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { FetchOptions } from 'ofetch';

export type FetchesRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<RequestConfig>;
};

export type AxiosRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<AxiosRequestConfig>;
};

export type OFetchRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<FetchOptions>;
};

export type IsParamsRequired<TFunc extends (...args: any[]) => any> =
  Parameters<TFunc> extends [infer P] ? (undefined extends P ? false : true) : false;

export type TanstackQuerySettings<TFunc extends (...args: any[]) => Promise<any>> = {
  params?: Omit<UseQueryOptions<Awaited<ReturnType<TFunc>>, never>, 'queryKey'>;
} & (IsParamsRequired<TFunc> extends true
  ? { request: NonNullable<Parameters<TFunc>[0]> }
  : { request?: NonNullable<Parameters<TFunc>[0]> });

export type TanstackSuspenseQuerySettings<TFunc extends (...args: any[]) => Promise<any>> = {
  params?: Omit<UseSuspenseQueryOptions<Awaited<ReturnType<TFunc>>, never>, 'queryKey'>;
} & (IsParamsRequired<TFunc> extends true
  ? { request: NonNullable<Parameters<TFunc>[0]> }
  : { request?: NonNullable<Parameters<TFunc>[0]> });

export interface TanstackMutationSettings<TFunc extends (...args: any[]) => Promise<any>> {
  params?: UseMutationOptions<Awaited<ReturnType<TFunc>>, never, Parameters<TFunc>[0], unknown>;
  request?: NonNullable<Parameters<TFunc>[0]>;
}

export type ApicraftAxiosResponse<Data = never, Error = never> = AxiosResponse<Data | Error>;
export type ApicraftFetchesResponse<Data = never, Error = never> = FetchesResponse<Data | Error>;
export type ApicraftOfetchResponse<Data = never, Error = never> = Data | Error;
