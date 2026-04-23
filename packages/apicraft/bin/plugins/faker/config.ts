import { definePluginConfig } from '@hey-api/openapi-ts';

import type { FakerPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: FakerPlugin['Config'] = {
  config: {
    generateOutput: '',
    exportFromIndex: true
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'faker',
  output: '.'
};

export const defineFakerPlugin = definePluginConfig(defaultConfig);
