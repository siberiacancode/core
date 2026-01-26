import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface FetchesPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy: NonNullable<ApicraftOption['groupBy']>;
  name: 'fetches';
  nameBy: NonNullable<ApicraftOption['nameBy']>;
  output?: string;
  runtimeInstancePath?: string;
}

export type FetchesPlugin = DefinePlugin<FetchesPluginConfig>;
