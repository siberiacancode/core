import type { TanstackPlugin } from './types';

import { classHandler } from './class/plugin';
import { composedHandler } from './composed/plugin';

export const handler: TanstackPlugin['Handler'] = ({ plugin }) => {
  if (plugin.config.groupBy === 'class') {
    classHandler({ plugin });
  }
  if (plugin.config.groupBy === 'paths' || plugin.config.groupBy === 'tags') {
    composedHandler({ plugin });
  }
};
