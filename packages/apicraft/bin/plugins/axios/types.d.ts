import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface AxiosPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'axios';
  nameBy?: ApicraftOption['nameBy'];
  output?: string;
  runtimeInstancePath?: string;
}

export type AxiosPlugin = DefinePlugin<AxiosPluginConfig>;
