import type { FakerPlugin } from '../types';

import { generateFakerFile } from '../helpers';

export const composedHandler: FakerPlugin['Handler'] = ({ plugin }) => {
  generateFakerFile({
    plugin,
    mode: 'standalone'
  });
};
