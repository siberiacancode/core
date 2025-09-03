import type { DefinePlugin } from '@hey-api/openapi-ts';

export interface UserConfig {
  myOption?: boolean;
  name: 'axios-plugin';
  output?: string;
}

export type AxiosPlugin = DefinePlugin<UserConfig>;
