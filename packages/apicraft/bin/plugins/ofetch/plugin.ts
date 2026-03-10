import type { OFetchPlugin } from './types';

import { classHandler } from './class/plugin';
import { composedHandler } from './composed/plugin';
import { standaloneHandler } from './standalone/plugin';

export const handler: OFetchPlugin['Handler'] = ({ plugin }) => {
  if (plugin.config.groupBy === 'class') {
    classHandler({ plugin });
  }
  if (plugin.config.groupBy === 'standalone') {
    standaloneHandler({ plugin });
  }
  if (plugin.config.groupBy === 'paths' || plugin.config.groupBy === 'tags') {
    composedHandler({ plugin });
  }
};
