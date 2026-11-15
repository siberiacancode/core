import process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { caseids } from './commands';

export const cli = (argv = hideBin(process.argv)) =>
  yargs(argv)
    .scriptName('autotest')
    .usage('Usage: $0 <command> [args]')
    .command(caseids)
    .demandCommand(1)
    .strictCommands()
    .epilogue('More info: https://github.com/siberiacancode/core/tree/main/packages/autotest#readme')
    .version()
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    .parse();
