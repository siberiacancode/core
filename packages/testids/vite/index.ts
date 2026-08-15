import { resolve } from 'node:path';
import process from 'node:process';

import type { TestidsOptions } from '../src/types';

import { DEFAULT_ATTRIBUTE, DEFAULT_NAME, DEFAULT_SEPARATOR } from '../src/utils/constants';
import { flatten, generate, readSchema, validate, write } from '../src/utils/helpers';
import { strip } from './strip/strip';

export interface TestidsPluginOptions extends TestidsOptions {
  /** @description regenerate the constants file on build and on schema change @default true */
  generate?: boolean;
  /** @description files the strip transform runs on @default /\.[jt]sx$/ */
  include?: RegExp;
  /** @description fail the build when the schema has validation errors @default true */
  strict?: boolean;
  /**
   * @description remove the attribute from the bundle
   * @default true on `vite build`, false on `vite dev`
   */
  strip?: boolean;
}

const LABEL = '[testids]';

export const testids = (options: TestidsPluginOptions = {}) => {
  const input = options.input ?? 'testids.yaml';
  const output = options.output ?? 'src/constants/testids.ts';
  const attribute = options.attribute ?? DEFAULT_ATTRIBUTE;
  const include = options.include ?? /\.[jt]sx$/;
  const name = options.name ?? DEFAULT_NAME;
  const separator = options.separator ?? DEFAULT_SEPARATOR;

  let root = process.cwd();
  let shouldStrip = options.strip ?? false;
  let sourcemap = true;

  const run = async (logger: {
    error: (message: string) => void;
    info: (message: string) => void;
  }) => {
    if (options.generate === false) return;

    const tree = await readSchema(resolve(root, input));

    const nodes = flatten(tree, {
      name,
      separator
    });

    const problems = validate(nodes, {
      separator
    });

    const errors = problems.filter((issue) => issue.level === 'error');

    if (errors.length) {
      const details = errors
        .map((issue) => `  ${issue.path.join('.')} — ${issue.message}`)
        .join('\n');

      const message = `${LABEL} schema has ${errors.length} error(s):\n${details}`;

      if (options.strict !== false) {
        throw new Error(message);
      }

      logger.error(message);
    }

    const changed = await write(resolve(root, output), generate(nodes, { name }));

    if (changed) {
      logger.info(`${LABEL} generated ${nodes.length} ids → ${output}`);
    }
  };

  return {
    name: 'siberiacancode:testids',
    enforce: 'pre' as const,

    configResolved(config: any) {
      root = config.root ?? root;
      sourcemap = Boolean(config.build?.sourcemap);
      shouldStrip = options.strip ?? config.command === 'build';
    },

    async buildStart() {
      await run(console);
    },

    configureServer(server: any) {
      const schema = resolve(root, input);

      server.watcher.add(schema);
      server.watcher.on('change', async (file: string) => {
        if (resolve(file) !== schema) {
          return;
        }
        await run(server.config.logger).catch((error: Error) => {
          server.config.logger.error(error.message);
        });
      });
    },

    async transform(code: string, id: string) {
      if (!shouldStrip) return null;

      const filename = id.split('?')[0];
      if (!include.test(filename)) return null;
      if (!code.includes(attribute)) return null;

      return strip(code, {
        attribute,
        filename: id,
        sourcemap
      });
    }
  };
};

export default testids;
