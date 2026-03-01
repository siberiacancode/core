import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface ReatomPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'reatom';
  nameBy?: ApicraftOption['nameBy'];
  output?: string;
}

export type ReatomPlugin = DefinePlugin<ReatomPluginConfig>;
