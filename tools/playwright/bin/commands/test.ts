import type { Argv } from 'yargs';

import process from 'node:process';

import type { DockerOptions } from '@/bin/helpers';

import { dockerExec, loadEnv, parseMount, run } from '@/bin/helpers';

interface TestArgv {
  configs?: string[];
  container: string;
  dockerfile: string;
  envFile?: string;
  image: string;
  local: boolean;
  mount: string[];
  '--'?: string[];
}

const playwright = (configs: string[], passthrough: string[], env: NodeJS.ProcessEnv) => {
  const args = ['playwright', 'test'];
  configs.forEach((config) => args.push('-c', config));
  return run('npx', [...args, ...passthrough], { env });
};

export const test = {
  command: ['$0 [configs..]', 'test [configs..]'],
  describe: 'Run one or more Playwright configs',
  builder: (yargs: Argv) =>
    yargs
      .positional('configs', {
        type: 'string',
        array: true,
        describe: 'Paths to Playwright config files'
      })
      .option('local', {
        alias: 'l',
        type: 'boolean',
        default: true,
        description: 'Run on the host instead of docker'
      })
      .option('env-file', {
        type: 'string',
        description: 'Env file to load before running'
      })
      .option('image', {
        type: 'string',
        default: 'pw-tests-image',
        description: 'Docker image name'
      })
      .option('container', {
        type: 'string',
        default: 'pw-tests-container',
        description: 'Docker container name'
      })
      .option('dockerfile', {
        type: 'string',
        default: 'Dockerfile',
        description: 'Path to the Dockerfile'
      })
      .option('mount', {
        type: 'string',
        array: true,
        default: [] as string[],
        description: 'Docker mount "src:dst[:ro]" (repeatable)'
      }),
  handler: async (argv: TestArgv) => {
    const configs = (argv.configs ?? []).filter(Boolean);

    // everything after `--` is passed through to playwright
    const passthrough = argv['--'] ?? [];

    if (!configs.length) {
      console.error('No configs provided. Usage: pw <config...> [flags]');
      process.exit(1);
    }

    if (!argv.local) {
      const dockerOptions: DockerOptions = {
        image: argv.image,
        container: argv.container,
        dockerfile: argv.dockerfile,
        mounts: argv.mount.map(parseMount)
      };

      const dockerArgs = [
        ...configs,
        '--local',
        ...(argv.envFile ? ['--env-file', argv.envFile] : []),
        ...(passthrough.length ? ['--', ...passthrough] : [])
      ];
      process.exit(await dockerExec(dockerOptions, dockerArgs));
    }

    const env = await loadEnv(argv.envFile);

    let code = 0;
    for (const config of configs) {
      const result = await playwright([config], passthrough, env);
      code = code || result;
    }
    process.exit(code);
  }
};
