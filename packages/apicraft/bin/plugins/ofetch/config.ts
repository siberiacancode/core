import { definePluginConfig } from '@hey-api/openapi-ts';

import type { OFetchPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: OFetchPlugin['Config'] = {
  config: {
    generateOutput: '',
    exportFromIndex: true
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'ofetch',
  output: '.'
};

export const defineOfetchPlugin = definePluginConfig(defaultConfig);
