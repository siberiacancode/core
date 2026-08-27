import process from 'node:process';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { test } from './commands';

export const cli = () =>
  yargs(hideBin(process.argv))
    .scriptName('pw')
    .usage('Usage: $0 <config...> [flags]')
    .command(test)
    .parserConfiguration({ 'populate--': true })
    .epilogue('More info: https://git.ftc.ru/tomsk/web-koronapay-core')
    .version()
    .alias('v', 'version')
    .help()
    .alias('h', 'help')
    .parse();
