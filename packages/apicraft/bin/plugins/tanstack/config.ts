import { definePluginConfig } from '@hey-api/openapi-ts';

import type { TanstackPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: TanstackPlugin['Config'] = {
  config: {
    generateOutput: '',
    exportFromIndex: true,
    nameBy: 'path',
    groupBy: 'path'
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'tanstack',
  output: ''
};

export const defineTanstackPlugin = definePluginConfig(defaultConfig);
