import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface OfetchPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'ofetch';
  nameBy?: ApicraftOption['nameBy'];
  output?: string;
  runtimeInstancePath?: string;
}

export type OfetchPlugin = DefinePlugin<OfetchPluginConfig>;
