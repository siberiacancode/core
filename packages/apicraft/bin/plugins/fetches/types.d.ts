import type { DefinePlugin } from '@hey-api/openapi-ts';

export interface FetchesPluginConfig {
  generateOutput: string;
  name: 'fetches';
  output?: string;
  runtimeInstancePath?: string;
}

export type FetchesPlugin = DefinePlugin<FetchesPluginConfig>;
