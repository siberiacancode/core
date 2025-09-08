import type { UserConfig } from '@hey-api/openapi-ts';
import type { Argv } from 'yargs';

import { createClient } from '@hey-api/openapi-ts';

import { findPluginConfig, getConfig } from '@/bin/helpers';

import type { ApicraftOption, GenerateApicraftOption } from './schemas';

import { defineFetchesPlugin } from './plugins/fetches';
import { apicraftOptionSchema } from './schemas';

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
      })
      .option('axios', {
        alias: 'a',
        type: 'boolean',
        description: 'Generate axios requests or not'
      }),
  handler: async (argv: GenerateApicraftOption) => {
    try {
      let options: ApicraftOption[];

      const useConfig = !argv.input && !argv.output;
      if (useConfig) {
        options = await getConfig();
      } else {
        options = [
          apicraftOptionSchema.parse({
            input: argv.input,
            output: argv.output
          })
        ];
      }

      for (const option of options) {
        const plugins: any[] = ['@hey-api/typescript'];

        const axiosPluginConfig = findPluginConfig(option.plugins, 'axios');
        if (axiosPluginConfig) {
          plugins.push('@hey-api/client-axios');
        }

        const fetchesPluginConfig = findPluginConfig(option.plugins, 'fetches');
        if (fetchesPluginConfig) {
          plugins.push(
            defineFetchesPlugin({
              include: option.include,
              exclude: option.exclude,
              generateOutput:
                typeof option.output === 'string' ? option.output : option.output.path,
              ...(typeof fetchesPluginConfig === 'object' && {
                runtimeInstancePath: fetchesPluginConfig.runtimeInstancePath
              })
            })
          );
        }

        await createClient({
          parser: { filters: { operations: { include: option.include, exclude: option.exclude } } },
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
