import type { Argv } from 'yargs';

import { resolve } from 'node:path';
import process from 'node:process';
import colors from 'picocolors';

import { logger } from '@/bin/helpers';
import { DEFAULT_NAME, DEFAULT_SEPARATOR } from '@/src/utils/constants';
import { generate as build, flatten, readSchema, validate, write } from '@/src/utils/helpers';

interface GenerateArgv {
  case?: 'lower' | 'preserve' | 'upper';
  input: string;
  name: string;
  output: string;
  separator: string;
  strict: boolean;
}

export const generate = {
  command: ['$0', 'generate'],
  describe: 'Generate the testid constants file from the yaml schema',
  builder: (yargs: Argv) =>
    yargs
      .option('input', {
        alias: 'i',
        type: 'string',
        default: 'testids.yaml',
        description: 'path to the yaml schema'
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        default: 'src/constants/testids.ts',
        description: 'path to the generated constants file'
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
      })
      .option('strict', {
        type: 'boolean',
        default: true,
        description: 'fail when the schema has validation errors'
      }),
  handler: async (argv: GenerateArgv) => {
    try {
      const tree = await readSchema(resolve(process.cwd(), argv.input));
      const nodes = flatten(tree, {
        name: argv.name,
        separator: argv.separator
      });

      const problems = validate(nodes, { separator: argv.separator });
      const errors = problems.filter((issue) => issue.level === 'error');

      if (errors.length) {
        console.info(logger.title('testids generate'));
        console.info(logger.issues(errors));

        if (argv.strict) {
          console.info(colors.red(`\n  ${errors.length} error(s), fix for generate ids\n`));
          process.exit(1);
        }
      }

      const output = resolve(process.cwd(), argv.output);
      const changed = await write(output, build(nodes, { name: argv.name }));

      console.info(logger.title('testids generate'));
      console.info(
        `  ${logger.SYMBOLS.success} ${nodes.length} ids ${changed ? 'written to' : 'already up to date in'} ${colors.bold(argv.output)}\n`
      );
    } catch (error: any) {
      console.info(`\n${logger.SYMBOLS.error} ${error.message}\n`);
      process.exit(1);
    }
  }
};
