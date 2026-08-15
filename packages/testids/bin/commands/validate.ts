import type { Argv } from 'yargs';

import { resolve } from 'node:path';
import process from 'node:process';
import colors from 'picocolors';

import { logger } from '@/bin/helpers';
import { DEFAULT_NAME, DEFAULT_SEPARATOR } from '@/src/utils/constants';
import { validate as check, flatten, readSchema } from '@/src/utils/helpers';

interface ValidateArgv {
  input: string;
  name: string;
  separator: string;
}

export const validate = {
  command: 'validate',
  describe: 'Validate segment naming and id uniqueness',
  builder: (yargs: Argv) =>
    yargs
      .option('input', {
        alias: 'i',
        type: 'string',
        default: 'testids.yaml',
        description: 'path to the yaml schema'
      })
      .option('name', {
        alias: 'n',
        type: 'string',
        default: DEFAULT_NAME,
        description: 'exported constant name'
      })
      .option('separator', {
        alias: 's',
        type: 'string',
        default: DEFAULT_SEPARATOR,
        description: 'separator between path segments'
      }),
  handler: async (argv: ValidateArgv) => {
    try {
      const tree = await readSchema(resolve(process.cwd(), argv.input));
      const nodes = flatten(tree, {
        name: argv.name,
        separator: argv.separator
      });

      const problems = check(nodes, { separator: argv.separator });

      const errors = problems.filter((issue) => issue.level === 'error');
      const warnings = problems.filter((issue) => issue.level === 'warning');

      console.info(logger.title('testids validate'));

      if (!problems.length) {
        console.info(`  ${logger.SYMBOLS.success} ${nodes.length} ids, no issues\n`);
        return;
      }

      console.info(logger.issues(problems));
      console.info(
        `\n  ${colors.red(`${errors.length} error(s)`)}  ${colors.yellow(`${warnings.length} warning(s)`)}\n`
      );

      if (errors.length) {
        process.exit(1);
      }
    } catch (error: any) {
      console.info(`\n${logger.SYMBOLS.error} ${error.message}\n`);
      process.exit(1);
    }
  }
};
