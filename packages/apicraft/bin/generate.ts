import type { UserConfig } from '@hey-api/openapi-ts';
import type { Argv } from 'yargs';

import { createClient } from '@hey-api/openapi-ts';

import { getConfig } from '@/bin/utils/helpers';

import type { Api, ArrayElement, GenerateOptions } from './utils/types';

import { apiSchema } from './utils/types';

export const generate = {
  command: ['$0', 'generate'],
  describe: 'Generate types, requests and hooks',
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
      .option('types', {
        alias: 't',
        type: 'boolean',
        description: 'Generate typescript types or not'
      })
      .option('axios', {
        alias: 'a',
        type: 'boolean',
        description: 'Generate axios requests or not'
      }),
  handler: async (argv: GenerateOptions) => {
    try {
      let apis: Api[];

      const useConfig = !argv.input && !argv.output && !argv.types && !argv.axios;
      if (useConfig) {
        apis = await getConfig();
      } else {
        apis = [
          apiSchema.parse({
            input: argv.input,
            output: argv.output,
            types: argv.types,
            axios: argv.axios
          })
        ];
      }

      for (const api of apis) {
        const plugins: ArrayElement<UserConfig['plugins']>[] = [];
        if (api.types) {
          plugins.push('@hey-api/typescript');
        }
        if (api.axios) {
          plugins.push('@hey-api/client-axios');
        }
        // TODO: if plugins is [], no files will be generated with no error. we can pass ['@hey-api/typescript'] as default and delete 'types' flag
        await createClient({
          input: api.input,
          output: api.output,
          plugins
        });
      }

      console.info('\n🎉  Generation done! Thanks for using apicraft! 🎉');
    } catch (cancelled: any) {
      console.info(cancelled?.message);
      process.exit(1);
    }
  }
};
