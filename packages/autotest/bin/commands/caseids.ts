import type { Argv } from 'yargs';

import { relative, resolve } from 'node:path';
import process from 'node:process';
import colors from 'picocolors';

import {
  DEFAULT_CASE_IDS_EXCLUDE,
  DEFAULT_CASE_IDS_FUNCTION_NAME,
  DEFAULT_CASE_IDS_INPUT,
  DEFAULT_CASE_IDS_LAST_ID_NAME,
  DEFAULT_CASE_IDS_NAME,
  DEFAULT_CASE_IDS_OUTPUT,
  DEFAULT_CASE_IDS_REFERENCES,
  generateCaseIds
} from '@/src/caseids';

interface CaseIdsArgv {
  exclude: string[];
  functionName: string;
  input: string;
  lastIdName: string;
  name: string;
  output: string;
  references: string;
  updateReferences: boolean;
}

export const caseids = {
  command: 'caseids',
  describe: 'Generate and assign stable IDs for test cases',
  builder: (yargs: Argv) =>
    yargs
      .option('input', {
        alias: 'i',
        type: 'string',
        default: DEFAULT_CASE_IDS_INPUT,
        description: 'directory containing test case files'
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        default: DEFAULT_CASE_IDS_OUTPUT,
        description: 'path to the generated case ID constants'
      })
      .option('references', {
        alias: 'r',
        type: 'string',
        default: DEFAULT_CASE_IDS_REFERENCES,
        description: 'directory in which renamed constant references are updated'
      })
      .option('exclude', {
        alias: 'x',
        type: 'array',
        string: true,
        default: [...DEFAULT_CASE_IDS_EXCLUDE],
        description: 'directories to exclude, relative to input'
      })
      .option('function-name', {
        type: 'string',
        default: DEFAULT_CASE_IDS_FUNCTION_NAME,
        description: 'test case factory function name'
      })
      .option('name', {
        alias: 'n',
        type: 'string',
        default: DEFAULT_CASE_IDS_NAME,
        description: 'generated case IDs constant name'
      })
      .option('last-id-name', {
        type: 'string',
        default: DEFAULT_CASE_IDS_LAST_ID_NAME,
        description: 'generated last assigned ID constant name'
      })
      .option('update-references', {
        type: 'boolean',
        default: true,
        description: 'update renamed case ID references'
      }),
  handler: async (argv: CaseIdsArgv) => {
    try {
      const cwd = process.cwd();
      const result = await generateCaseIds({
        cwd,
        constantName: argv.name,
        exclude: argv.exclude,
        functionName: argv.functionName,
        input: argv.input,
        lastIdName: argv.lastIdName,
        output: argv.output,
        references: argv.references,
        updateReferences: argv.updateReferences
      });

      const output = relative(cwd, resolve(cwd, argv.output));
      const changed = result.changedFiles.length
        ? `${result.changedFiles.length} file(s) updated`
        : 'already up to date';

      console.info(`\n${colors.cyan('◆')}  ${colors.bold('autotest caseids')}\n`);
      console.info(
        `  ${colors.green('✔')} ${result.caseCount} case ID(s) in ${colors.bold(output)}, ${changed}\n`
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\n${colors.red('✖')} ${message}\n`);
      process.exitCode = 1;
    }
  }
};
