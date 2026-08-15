import process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { check, generate, validate } from './commands';

export const cli = () =>
  yargs(hideBin(process.argv))
    .scriptName('testids')
    .usage('Usage: $0 <command> [args]')
    .command(generate)
    .command(validate)
    .command(check)
    .epilogue('More info: https://github.com/siberiacancode/core/tree/main/packages/testids#readme')
    .version()
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    .parse();
