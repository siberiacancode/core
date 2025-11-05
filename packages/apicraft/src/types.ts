import type { RequestConfig } from '@siberiacancode/fetches';
import type { UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';

export type FetchesRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<RequestConfig>;
};

export type IsParamsRequired<TFunc extends (...args: any[]) => any> =
  Parameters<TFunc> extends [infer P] ? (undefined extends P ? false : true) : false;

export type TanstackQuerySettings<TFunc extends (...args: any[]) => Promise<any>> = {
  query?: Omit<UseQueryOptions<Awaited<ReturnType<TFunc>>, never>, 'queryKey'>;
} & (IsParamsRequired<TFunc> extends true
  ? { request: NonNullable<Parameters<TFunc>[0]> }
  : { request?: NonNullable<Parameters<TFunc>[0]> });

export interface TanstackMutationSettings<TFunc extends (...args: any[]) => Promise<any>> {
  mutation?: UseMutationOptions<Awaited<ReturnType<TFunc>>, never, Parameters<TFunc>[0], unknown>;
  request?: NonNullable<Parameters<TFunc>[0]>;
}
