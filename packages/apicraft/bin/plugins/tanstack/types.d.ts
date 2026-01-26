import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface TanstackPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy: NonNullable<ApicraftOption['groupBy']>;
  name: 'tanstack';
  nameBy: NonNullable<ApicraftOption['nameBy']>;
  output?: string;
}

export type TanstackPlugin = DefinePlugin<TanstackPluginConfig>;
