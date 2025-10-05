import type { DefinePlugin } from '@hey-api/openapi-ts';

export interface FetchesPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  name: 'fetches';
  output?: string;
  runtimeInstancePath?: string;
}

export type FetchesPlugin = DefinePlugin<FetchesPluginConfig>;
