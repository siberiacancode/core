import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface OFetchPluginConfig {
  baseUrl?: ApicraftOption['baseUrl'];
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'ofetch';
  nameBy?: ApicraftOption['nameBy'];
  output?: string;
  runtimeInstancePath?: string;
}

export type OFetchPlugin = DefinePlugin<OFetchPluginConfig>;
