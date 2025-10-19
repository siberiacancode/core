import { definePluginConfig } from '@hey-api/openapi-ts';

import type { FetchesPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: FetchesPlugin['Config'] = {
  config: {
    generateOutput: '',
    exportFromIndex: true
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'fetches',
  output: ''
};

export const defineFetchesPlugin = definePluginConfig(defaultConfig);
