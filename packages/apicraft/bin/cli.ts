import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import type { InitOptionsSchema } from './utils/types';

import { init } from './init';
import { getConfig } from './utils/helpers';

export const cli = async () => {
  const processArgv = hideBin(process.argv);

  const config = await getConfig();

  if (processArgv.includes('init')) {
    const initCommandParams: InitOptionsSchema = config;
    return init(initCommandParams);
  }

  yargs(processArgv)
    .scriptName('apicraft')
    .usage('Usage: $0 <command> [args]')
    .epilogue('More info: https://github.com/siberiacancode/core/apicraft#readme')
    .version()
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    .parse();
};
