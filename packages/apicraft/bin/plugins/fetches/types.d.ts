import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface FetchesPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'fetches';
  nameBy?: ApicraftOption['nameBy'];
  output?: string;
  runtimeInstancePath?: string;
}

export type FetchesPlugin = DefinePlugin<FetchesPluginConfig>;
