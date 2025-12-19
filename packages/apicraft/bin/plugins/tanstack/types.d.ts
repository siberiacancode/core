import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface TanstackPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'tanstack';
  nameBy?: ApicraftOption['nameBy'];
  output?: string;
}

export type TanstackPlugin = DefinePlugin<TanstackPluginConfig>;
