import { definePluginConfig } from '@hey-api/openapi-ts';

import type { ReatomPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: ReatomPlugin['Config'] = {
  config: {
    generateOutput: '',
    exportFromIndex: true
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'reatom',
  output: '.'
};

export const defineReatomPlugin = definePluginConfig(defaultConfig);
