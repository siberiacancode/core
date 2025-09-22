import type { RequestConfig } from '@siberiacancode/fetches';

export type FetchesRequestParams<Params> = Params & { config: RequestConfig };
