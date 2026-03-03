import { cosmiconfig } from 'cosmiconfig';
import process from 'node:process';

import { apicraftConfigSchema } from '../schemas';

export const getConfig = async (path?: string) => {
  const explorer = cosmiconfig('apicraft', {
    searchPlaces: ['apicraft.config.js', 'apicraft.config.ts']
  });

  try {
    const configResult = (await (path ? explorer.load(path) : explorer.search()))!;
    return apicraftConfigSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(`Error loading configuration file in ${process.cwd()}. Error - ${error}`);
  }
};
