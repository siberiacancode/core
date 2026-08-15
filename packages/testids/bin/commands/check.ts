import type { Argv } from 'yargs';

import { resolve } from 'node:path';
import process from 'node:process';
import colors from 'picocolors';

import { logger } from '@/bin/helpers';
import { DEFAULT_NAME, DEFAULT_SEPARATOR } from '@/src/utils/constants';
import { collectUsage, DEFAULT_GLOBS, flatten, readSchema } from '@/src/utils/helpers';

interface CheckArgv {
  files: string[];
  ignore: string[];
  input: string;
  name: string;
  output: string;
  separator: string;
  strict: boolean;
  verbose: boolean;
}

export const check = {
  command: 'check',
  describe: 'Report testids whose generated constant paths are never referenced',
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
      .option('files', {
        type: 'array',
        string: true,
        default: DEFAULT_GLOBS,
        description: 'globs to scan for testid constant references'
      })
      .option('ignore', {
        type: 'array',
        string: true,
        default: [] as string[],
        description: 'extra globs to ignore'
      })
      .option('verbose', {
        type: 'boolean',
        default: false,
        description: 'list the files each id was found in'
      })
      .option('strict', {
        type: 'boolean',
        default: false,
        description: 'exit with code 1 when any testid is unused'
      }),
  handler: async (argv: CheckArgv) => {
    try {
      const tree = await readSchema(resolve(process.cwd(), argv.input));
      const nodes = flatten(tree, {
        name: argv.name,
        separator: argv.separator
      });

      const usage = await collectUsage(nodes, {
        name: argv.name,
        output: argv.output,
        globs: argv.files,
        ignore: argv.ignore
      });

      console.info(logger.title('testids check'));
      console.info(logger.summary(usage));

      const output = logger.section(usage, 'unused', argv.verbose);

      if (output) {
        console.info(output);
      }

      const unused = usage.filter((entry) => entry.status === 'unused');

      if (!unused.length) {
        console.info(`\n  ${logger.SYMBOLS.success} every testid constant is referenced\n`);
        return;
      }

      console.info(`\n  ${colors.dim(`${unused.length} of ${usage.length} ids are unused`)}\n`);

      if (argv.strict) {
        process.exit(1);
      }
    } catch (error: any) {
      console.info(`\n${logger.SYMBOLS.error} ${error.message}\n`);
      process.exit(1);
    }
  }
};
