import type { TanstackPlugin } from './types';

import { classHandler } from './class/plugin';
import { composedHandler } from './composed/plugin';

export const handler: TanstackPlugin['Handler'] = ({ plugin }) =>
  plugin.config.groupBy === 'class' ? classHandler({ plugin }) : composedHandler({ plugin });
