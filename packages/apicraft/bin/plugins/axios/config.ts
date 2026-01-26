import { definePluginConfig } from '@hey-api/openapi-ts';

import type { AxiosPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: AxiosPlugin['Config'] = {
  config: {
    generateOutput: '',
    exportFromIndex: true,
    nameBy: 'path',
    groupBy: 'path'
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'axios',
  output: ''
};

export const defineAxiosPlugin = definePluginConfig(defaultConfig);
