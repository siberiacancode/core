import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';

const pkg = require('./package.json');

const sourcemap = true;
const input = 'src/index.ts';
const banner = `/* @license ${pkg.name} v${pkg.version} */`;

/** @type {import('rollup').RollupOptions[]} */
export default [
  {
    input,
    output: [
      {
        format: 'cjs',
        file: pkg.main,
        sourcemap,
        banner
      },
      {
        format: 'esm',
        file: pkg.module,
        sourcemap,
        banner
      }
    ],
    external: [...Object.keys(pkg.peerDependencies ?? {})],
    plugins: [
      resolve({
        extensions: ['.js', '.ts']
      }),
      commonjs({
        include: /node_modules/,
        ignoreDynamicRequires: true
      }),
      typescript({
        tsconfig: './tsconfig.json',
        compilerOptions: { noEmit: true },
        noForceEmit: true
      }),
      babel({
        exclude: /node_modules/,
        extensions: ['.js', '.ts'],
        babelHelpers: 'bundled',
        presets: ['@babel/preset-env', '@babel/preset-typescript']
      }),
      json(),
      terser()
    ]
  },
  {
    input,
    output: [{ file: pkg.types, format: 'esm' }],
    plugins: [dts.default()]
  }
];
