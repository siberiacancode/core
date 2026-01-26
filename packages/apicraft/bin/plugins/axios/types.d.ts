import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface AxiosPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy: NonNullable<ApicraftOption['groupBy']>;
  name: 'axios';
  nameBy: NonNullable<ApicraftOption['nameBy']>;
  output?: string;
  runtimeInstancePath?: string;
}

export type AxiosPlugin = DefinePlugin<AxiosPluginConfig>;
