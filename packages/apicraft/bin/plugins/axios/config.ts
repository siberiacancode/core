import { definePluginConfig } from '@hey-api/openapi-ts';

import type { AxiosPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: AxiosPlugin['Config'] = {
  config: {
    myOption: false
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'axios-plugin',
  output: 'axios-plugin'
};

export const defineConfig = definePluginConfig(defaultConfig);
