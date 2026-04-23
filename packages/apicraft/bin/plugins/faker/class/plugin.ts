import type { FakerPlugin } from '../types';

import { generateFakerFile } from '../helpers';

export const classHandler: FakerPlugin['Handler'] = ({ plugin }) => {
  generateFakerFile({
    plugin,
    mode: 'class'
  });
};
