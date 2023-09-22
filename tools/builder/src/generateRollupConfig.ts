import type { RollupBabelInputPluginOptions as RollupBabelOptions } from '@rollup/plugin-babel';
import babel from '@rollup/plugin-babel';
import type { RollupCommonJSOptions } from '@rollup/plugin-commonjs';
import commonJS from '@rollup/plugin-commonjs';
import type { RollupNodeResolveOptions } from '@rollup/plugin-node-resolve';
import nodeResolve from '@rollup/plugin-node-resolve';
import type { Options as RollupTerserOptions } from '@rollup/plugin-terser';
import terser from '@rollup/plugin-terser';
import type { RollupTypescriptOptions } from '@rollup/plugin-typescript';
import typescript from '@rollup/plugin-typescript';
import { globSync } from 'glob';
import { fileURLToPath } from 'node:url';
import path from 'path';
import type {
  InputPluginOption,
  OutputOptions,
  Plugin as RollupPlugin,
  PluginImpl,
  RollupOptions
} from 'rollup';
import type { Options as RollupDtsOptions } from 'rollup-plugin-dts';

// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const dts = require('rollup-plugin-dts') as { default: PluginImpl<RollupDtsOptions> };

export interface GenerateRollupConfigParams {
  pkg: {
    name: string;
    main: string;
    types: string;
    module: string;
    version: string;
    peerDependencies?: Record<string, string>;
    [x: string]: unknown;
  };
  sourcemap?: boolean | 'inline' | 'hidden';
  external?: (string | RegExp)[];
  plugins?: InputPluginOption[];
  options?: RollupOptions[];
  input?: {
    entry?: string;
    pattern?: string;
    ignorePattern?: string;
  };
  output?: {
    main?: OutputOptions;
    types?: OutputOptions;
    module?: OutputOptions;
  };
  configs?: {
    babel?: RollupBabelOptions;
    dts?: RollupDtsOptions;
    terser?: RollupTerserOptions;
    commonJS?: RollupCommonJSOptions;
    typescript?: RollupTypescriptOptions;
    nodeResolve?: RollupNodeResolveOptions;
  };
}

const getRollupPlugin = <Options = unknown>(
  pluginFn: (options?: Options) => RollupPlugin,
  externalOptions?: Options,
  initialOptions?: Options
) => {
  if (typeof externalOptions !== 'undefined' && !externalOptions) return false;

  return pluginFn({
    ...((typeof initialOptions === 'object' ? initialOptions : {}) as Options),
    ...((typeof externalOptions === 'object' ? externalOptions : {}) as Options)
  });
};

export const generateRollupConfig = ({
  input: {
    entry = 'src/index.ts',
    pattern = 'src/**/*.{ts,tsx}',
    ignorePattern = 'src/**/*.{test,stories}.{ts,tsx}'
  } = {},
  sourcemap = true,
  external = [],
  options = [],
  plugins = [],
  configs = {},
  output = {},
  pkg
}: GenerateRollupConfigParams) => {
  const inputPattern = path.join(process.cwd(), pattern);
  const banner = `/* @license ${pkg.name} v${pkg.version} */`;

  const config: RollupOptions[] = [
    {
      input: Object.fromEntries(
        globSync(inputPattern.replace(/\\/g, '/'), {
          ignore: ignorePattern.replace(/\\/g, '/')
        }).map((file) => {
          return [
            path.relative(
              path.dirname(entry),
              file.slice(0, file.length - path.extname(file).length)
            ),
            fileURLToPath(new URL(`file:///${file}`, import.meta.url))
          ];
        })
      ),
      output: [
        {
          format: 'cjs',
          dir: path.dirname(pkg.main),
          sourcemap,
          banner,
          ...output.main
        },
        {
          format: 'esm',
          dir: path.dirname(pkg.module),
          sourcemap,
          banner,
          ...output.module
        }
      ],
      external: [...Object.keys(pkg.peerDependencies ?? {}), /@babel\/runtime/, ...external],
      plugins: [
        getRollupPlugin(nodeResolve, configs.nodeResolve, {
          extensions: ['.js', '.ts', '.tsx']
        }),
        getRollupPlugin(commonJS, configs.commonJS, {
          include: /node_modules/,
          ignoreDynamicRequires: true
        }),
        ...plugins,
        getRollupPlugin(typescript, configs.typescript, {
          tsconfig: './tsconfig.json',
          compilerOptions: { noEmit: true },
          noForceEmit: true
        }),
        getRollupPlugin(babel, configs.babel, {
          exclude: /node_modules/,
          extensions: ['.js', '.ts', '.tsx'],
          babelHelpers: 'runtime',
          presets: ['@babel/preset-env', '@babel/preset-typescript'],
          plugins: ['@babel/plugin-transform-runtime']
        }),
        getRollupPlugin(terser, configs.terser)
      ]
    },
    {
      input: entry,
      output: [{ file: pkg.types, format: 'esm', ...output.types }],
      external: [/\.(sass|scss|css)$/],
      plugins: [getRollupPlugin(dts.default, configs.dts)]
    },
    ...options
  ];

  return config;
};
