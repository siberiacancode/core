import type { UserConfig } from '@hey-api/openapi-ts';
import type { Argv } from 'yargs';

import { createClient } from '@hey-api/openapi-ts';
import process from 'node:process';

import { getConfig } from '@/bin/helpers';

import type { ApicraftOption, GenerateApicraftOption, InstanceName } from './schemas';

import { defineAxiosPlugin } from './plugins/axios';
import { defineAxiosClassPlugin } from './plugins/axiosClass';
import { defineFetchesPlugin } from './plugins/fetches';
import { defineTanstackPlugin } from './plugins/tanstack';
import { apicraftConfigSchema, apicraftOptionSchema } from './schemas';

export const generate = {
  command: ['$0', 'generate'],
  describe: 'Generate rest api content',
  builder: (yargs: Argv) =>
    yargs
      .option('input', {
        alias: 'i',
        type: 'string',
        description: 'Path to input api file'
      })
      .option('output', {
        alias: 'o',
        type: 'string',
        description: 'Path to output folder'
      }),
  handler: async (argv: GenerateApicraftOption) => {
    try {
      let options: ApicraftOption[];

      const useConfig = !argv.input && !argv.output;
      if (useConfig) {
        options = apicraftConfigSchema.parse(await getConfig());
      } else {
        options = [
          apicraftOptionSchema.parse({
            input: argv.input,
            output: argv.output
          })
        ];
      }

      for (const option of options) {
        const plugins: any[] = ['@hey-api/typescript', ...(option.plugins ?? [])];

        const matchInstance = (name: InstanceName) =>
          option.instance === name ||
          (typeof option.instance === 'object' && option.instance.name === name);

        if (matchInstance('axios')) {
          plugins.push(
            defineAxiosPlugin({
              generateOutput:
                typeof option.output === 'string' ? option.output : option.output.path,
              ...(typeof option.instance === 'object' && {
                runtimeInstancePath: option.instance.runtimeInstancePath
              }),
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy
            })
          );
        }

        if (matchInstance('axios/class')) {
          plugins.push(
            defineAxiosClassPlugin({
              generateOutput:
                typeof option.output === 'string' ? option.output : option.output.path,
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy
            })
          );
        }

        const generateOutput =
          typeof option.output === 'string' ? option.output : option.output.path;

        if (matchInstance('fetches')) {
          plugins.push(
            defineFetchesPlugin({
              generateOutput,
              ...(typeof option.instance === 'object' && {
                runtimeInstancePath: option.instance.runtimeInstancePath
              }),
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy
            })
          );
        }

        const tanstackPlugin = plugins.find(
          (plugin) => plugin === 'tanstack' || plugin.name === 'tanstack'
        );
        if (tanstackPlugin) {
          plugins.push(
            defineTanstackPlugin({
              generateOutput,
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy
            })
          );
        }

        await createClient({
          parser: { filters: option.filters },
          input: option.input,
          output: option.output,
          plugins: plugins as UserConfig['plugins']
        });
      }

      console.info('\n🎉  Generation done! Thanks for using apicraft! 🎉');
    } catch (error: any) {
      console.info(error.message);
      process.exit(1);
    }
  }
};
