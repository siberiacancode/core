import type { DefinePlugin } from '@hey-api/openapi-ts';

export interface FetchesPluginConfig {
  exclude?: string[];
  generateOutput: string;
  include?: string[];
  name: 'fetches';
  output?: string;
  runtimeInstancePath?: string;
}

export type FetchesPlugin = DefinePlugin<FetchesPluginConfig>;
