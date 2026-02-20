import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface AxiosClassPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'axiosClass';
  nameBy?: ApicraftOption['nameBy'];
  output?: string;
}

export type AxiosClassPlugin = DefinePlugin<AxiosClassPluginConfig>;
