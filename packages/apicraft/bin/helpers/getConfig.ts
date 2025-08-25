import { cosmiconfig } from 'cosmiconfig';

import { apicraftConfigSchema } from '../schemas';

export const getConfig = async () => {
  const explorer = cosmiconfig('apicraft', {
    searchPlaces: ['apicraft.config.js', 'apicraft.config.ts']
  });

  try {
    const configResult = (await explorer.search())!;
    return apicraftConfigSchema.parse(configResult.config);
  } catch (error) {
    throw new Error(
      `Invalid configuration apicraft.config.(js|ts) found in ${process.cwd()}. Error - ${error}`
    );
  }
};
