import type { FakerPlugin } from '../types';

import { generateFakerFile } from '../helpers';

export const standaloneHandler: FakerPlugin['Handler'] = ({ plugin }) => {
  generateFakerFile({
    plugin,
    mode: 'standalone'
  });
};
