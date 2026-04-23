import type { DefinePlugin } from '@hey-api/openapi-ts';

export interface FakerPluginConfig {
  exportFromIndex: boolean;
  generateOutput: string;
  name: 'faker';
  output?: string;
}

export type FakerPlugin = DefinePlugin<FakerPluginConfig>;
