import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { generate } from './generate';

export const cli = () =>
  yargs(hideBin(process.argv))
    .scriptName('apicraft')
    .usage('Usage: $0 [args]')
    .command(generate)
    .epilogue('More info: https://github.com/siberiacancode/core/apicraft#readme')
    .version()
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    .parse();
