import type { DefinePlugin } from '@hey-api/openapi-ts';

import type { ApicraftOption } from '@/bin/schemas';

export interface FakerPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  groupBy?: ApicraftOption['groupBy'];
  name: 'faker';
  output?: string;
  runtimeFakerInstancePath?: string;
}

export type FakerPlugin = DefinePlugin<FakerPluginConfig>;
