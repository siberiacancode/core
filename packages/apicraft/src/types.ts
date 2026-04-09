import type { AsyncDataOptions, AsyncOptions } from '@reatom/core';
import type { RequestConfig } from '@siberiacancode/fetches';
import type {
  UseMutationOptions,
  UseQueryOptions,
  UseSuspenseQueryOptions
} from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

export type FetchesRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<RequestConfig>;
};

export type AxiosRequestParams<Params> = Omit<Params, 'url'> & {
  config?: Partial<AxiosRequestConfig>;
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

export type ReatomAtom<TValue> = (() => TValue) & { __reatom: unknown };
export type ReatomAtomized<TValue> = TValue | ReatomAtom<TValue>;
export type ReatomDeepAtomized<TValue> = TValue extends readonly (infer Item)[]
  ? ReatomDeepAtomized<Item>[]
  : TValue extends object
    ? { [Key in keyof TValue]: ReatomDeepAtomized<TValue[Key]> | ReatomAtom<TValue[Key]> }
    : ReatomAtomized<TValue>;

export interface ReatomAsyncDataSettings<TFunc extends (...args: any[]) => Promise<any>> {
  params?: AsyncDataOptions<
    Awaited<ReturnType<TFunc>>,
    Parameters<TFunc>,
    Awaited<ReturnType<TFunc>>,
    Error,
    undefined
  >;
  request?: Partial<{
    [Key in keyof NonNullable<Parameters<TFunc>[0]>]: Key extends 'config'
      ? NonNullable<Parameters<TFunc>[0]>[Key]
      : ReatomDeepAtomized<NonNullable<Parameters<TFunc>[0]>[Key]>;
  }>;
}

export interface ReatomAsyncSettings<TFunc extends (...args: any[]) => Promise<any>> {
  params?: AsyncOptions<Error, undefined>;
  request?: NonNullable<Parameters<TFunc>[0]>;
}
