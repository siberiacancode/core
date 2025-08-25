import type { UserConfig } from '@hey-api/openapi-ts';
import type { Argv } from 'yargs';

import { createClient } from '@hey-api/openapi-ts';

import { getConfig } from '@/bin/helpers';

import type { ApicraftOption, GenerateApicraftOption } from './schemas';

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
  handler: async (argv: GenerateApicraftOption) => {
    try {
      let apis: ApicraftOption[];

      const useConfig = !argv.input && !argv.output && !argv.types && !argv.axios;
      if (useConfig) {
        apis = await getConfig();
      } else {
        apis = [
          apicraftOptionSchema.parse({
            input: argv.input,
            output: argv.output,
            types: argv.types,
            axios: argv.axios
          })
        ];
      }

      for (const api of apis) {
        const plugins = [];
        if (api.types) plugins.push('@hey-api/typescript');
        if (api.axios) plugins.push('@hey-api/client-axios');
        // TODO: if plugins is [], no files will be generated with no error. we can pass ['@hey-api/typescript'] as default and delete 'types' flag
        await createClient({
          input: api.input,
          output: api.output,
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
