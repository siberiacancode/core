import type { RequestConfig } from '@siberiacancode/fetches';

export type FetchesRequestParams<Data> = Data & { config: RequestConfig };
