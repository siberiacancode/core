import { cosmiconfig } from 'cosmiconfig';

import { configSchema } from '../types';

export const getConfig = async () => {
  const explorer = cosmiconfig('apicraft', {
    searchPlaces: ['apicraft.config.js', 'apicraft.config.ts']
  });

  try {
    const configResult = (await explorer.search())!;
    return configSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(`Invalid configuration found in ./apicraft.config.(js|ts). Error - ${error}`);
  }
};
