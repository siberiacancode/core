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
      .option('axios', {
        alias: 'a',
        type: 'boolean',
        description: 'Generate axios requests or not'
      }),
  handler: async (argv: GenerateApicraftOption) => {
    try {
      let options: ApicraftOption[];

      const useConfig = !argv.input && !argv.output && !argv.axios;
      if (useConfig) {
        options = await getConfig();
      } else {
        options = [
          apicraftOptionSchema.parse({
            input: argv.input,
            output: argv.output,
            axios: argv.axios
          })
        ];
      }

      for (const option of options) {
        const plugins = ['@hey-api/typescript'];
        if (option.axios) plugins.push('@hey-api/client-axios');
        await createClient({
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
