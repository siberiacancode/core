import type { AxiosPlugin } from './types';

import { classHandler } from './class/plugin';
import { composedHandler } from './composed/plugin';

export const handler: AxiosPlugin['Handler'] = ({ plugin }) =>
  plugin.config.groupBy === 'class' ? classHandler({ plugin }) : composedHandler({ plugin });
