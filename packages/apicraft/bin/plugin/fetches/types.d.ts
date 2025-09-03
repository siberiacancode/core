import type { DefinePlugin } from '@hey-api/openapi-ts';

export interface UserConfig {
  /**
   * User-configurable option for your plugin.
   *
   * @default false
   */
  myOption?: boolean;
  /**
   * Plugin name. Must be unique.
   */
  name: 'fetches-plugin';
  /**
   * Name of the generated file.
   *
   * @default 'my-plugin'
   */
  output?: string;
}

export type FetchesPlugin = DefinePlugin<UserConfig>;
