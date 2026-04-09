import type { UserConfig } from '@hey-api/openapi-ts';
import type { Argv } from 'yargs';

import { createClient } from '@hey-api/openapi-ts';
import process from 'node:process';

import type { Dependency } from '@/bin/helpers';

import { getConfig, installDependencies } from '@/bin/helpers';

import type { ApicraftOption, GenerateApicraftOption, InstanceName } from './schemas';

import { defineAxiosPlugin } from './plugins/axios';
import { defineFetchesPlugin } from './plugins/fetches';
import { defineOfetchPlugin } from './plugins/ofetch';
import { defineReatomPlugin } from './plugins/reatom';
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
      })
      .option('config', {
        alias: 'c',
        type: 'string',
        description: 'Path to config file'
      }),
  handler: async (argv: GenerateApicraftOption) => {
    try {
      let options: ApicraftOption[];

      const useConfig = !argv.input && !argv.output;
      if (useConfig) {
        options = apicraftConfigSchema.parse(await getConfig(argv.config));
      } else {
        options = [
          apicraftOptionSchema.parse({
            input: argv.input,
            output: argv.output
          })
        ];
      }

      for (const option of options) {
        const dependencies: Set<Dependency> = new Set();
        const plugins: any[] = ['@hey-api/typescript', ...(option.plugins ?? [])];

        const matchInstance = (name: InstanceName) =>
          option.instance === name ||
          (typeof option.instance === 'object' && option.instance.name === name);

        const generateOutput =
          typeof option.output === 'string' ? option.output : option.output.path;
        const runtimeInstancePath =
          typeof option.instance === 'object' ? option.instance.runtimeInstancePath : undefined;

        if (matchInstance('axios')) {
          dependencies.add('axios');
          plugins.push(
            defineAxiosPlugin({
              generateOutput,
              runtimeInstancePath,
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy,
              baseUrl: option.baseUrl
            })
          );
        }

        if (matchInstance('fetches')) {
          dependencies.add('@siberiacancode/fetches');
          plugins.push(
            defineFetchesPlugin({
              generateOutput,
              runtimeInstancePath,
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy,
              baseUrl: option.baseUrl
            })
          );
        }

        if (matchInstance('ofetch')) {
          dependencies.add('ofetch');
          plugins.push(
            defineOfetchPlugin({
              generateOutput,
              runtimeInstancePath,
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy,
              baseUrl: option.baseUrl
            })
          );
        }

        const tanstackPlugin = plugins.find(
          (plugin) => plugin === 'tanstack' || plugin.name === 'tanstack'
        );
        if (tanstackPlugin) {
          dependencies.add('@tanstack/react-query');
          plugins.push(
            defineTanstackPlugin({
              generateOutput,
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy,
              baseUrl: option.baseUrl
            })
          );
        }

        const reatomPlugin = plugins.find(
          (plugin) => plugin === 'reatom' || plugin.name === 'reatom'
        );
        if (reatomPlugin) {
          dependencies.add('@reatom/core');
          plugins.push(
            defineReatomPlugin({
              generateOutput,
              exportFromIndex: true,
              nameBy: option.nameBy,
              groupBy: option.groupBy,
              baseUrl: option.baseUrl
            })
          );
        }

        await installDependencies(Array.from(dependencies));

        await createClient({
          ...(option.parser && { parser: option.parser as UserConfig['parser'] }),
          input: typeof option.input === 'function' ? await option.input() : option.input,
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
