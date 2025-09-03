import { definePluginConfig } from '@hey-api/openapi-ts';

import type { FetchesPlugin } from './types';

import { handler } from './plugin';

export const defaultConfig: FetchesPlugin['Config'] = {
  config: {
    myOption: false // implements default value from types
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: 'fetches-plugin',
  output: 'fetches-plugin'
};

/**
 * Type helper for `my-plugin` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
