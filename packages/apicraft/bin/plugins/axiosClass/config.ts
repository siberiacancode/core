import { definePluginConfig } from '@hey-api/openapi-ts';

import type { AxiosClassPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: AxiosClassPlugin['Config'] = {
  config: {
    generateOutput: '',
    exportFromIndex: true
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'axiosClass',
  output: '.'
};

export const defineAxiosClassPlugin = definePluginConfig(defaultConfig);
