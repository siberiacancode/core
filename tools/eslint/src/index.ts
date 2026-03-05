import type {
  Awaitable,
  ConfigNames,
  OptionsConfig,
  TypedFlatConfigItem
} from '@antfu/eslint-config';
import type { Linter } from 'eslint';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';

import antfu from '@antfu/eslint-config';
import pluginCss from '@eslint/css';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPlaywright from 'eslint-plugin-playwright';
import path from 'node:path';
import process from 'node:process';

import { siberiacancodePlugin } from './plugin/index';

type EslintOptions = OptionsConfig &
  TypedFlatConfigItem & {
    jsxA11y?: boolean;
    playwright?: boolean;
    typescript?: 'engine';
  };

export type Eslint = (
  options?: EslintOptions,
  ...userConfigs: Awaitable<
    FlatConfigComposer<any, any> | Linter.Config[] | TypedFlatConfigItem | TypedFlatConfigItem[]
  >[]
) => FlatConfigComposer<TypedFlatConfigItem, ConfigNames>;

export const eslint: Eslint = (inputOptions = {} as EslintOptions, ...configs) => {
  const { jsxA11y = false, playwright = false, typescript = false, ...options } = inputOptions;

  const stylistic = options.stylistic ?? false;

  if (typescript === 'engine') {
    configs.unshift({
      name: 'siberiacancode/typescript',
      files: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
      rules: {
        'ts/promise-function-async': 'off',
        'ts/strict-boolean-expressions': 'off',
        'ts/no-unnecessary-condition': 'error',
        'ts/no-namespace': 'off',
        'ts/no-floating-promises': 'off',
        'ts/no-misused-promises': 'off',
        'ts/no-empty-object-type': 'warn'
      }
    });
  }

  if (jsxA11y) {
    const jsxA11yRules = pluginJsxA11y.flatConfigs.recommended.rules as Linter.RulesRecord;

    configs.unshift({
      name: 'siberiacancode/jsx-a11y',
      plugins: {
        'siberiacancode-jsx-a11y': pluginJsxA11y
      },
      rules: {
        ...Object.entries(jsxA11yRules).reduce<Linter.RulesRecord>((acc, [key, value]) => {
          acc[key.replace('jsx-a11y', 'siberiacancode-jsx-a11y')] = value;
          return acc;
        }, {})
      }
    });
  }

  if (playwright) {
    const playwrightRules = pluginPlaywright.configs['flat/recommended']
      .rules as Linter.RulesRecord;

    configs.unshift({
      name: 'siberiacancode/playwright',
      plugins: {
        'siberiacancode-playwright': pluginPlaywright
      },
      rules: {
        ...Object.entries(playwrightRules).reduce<Linter.RulesRecord>((acc, [key, value]) => {
          acc[key.replace('playwright', 'siberiacancode-playwright')] = value;
          return acc;
        }, {})
      }
    });
  }

  if (stylistic) {
    configs.unshift({
      name: 'siberiacancode/formatter',
      rules: {
        'style/arrow-parens': ['error', 'always'],
        'style/brace-style': 'off',
        'style/comma-dangle': ['error', 'never'],
        'style/indent': ['error', 2, { SwitchCase: 1 }],
        'style/jsx-curly-newline': 'off',
        'style/jsx-one-expression-per-line': 'off',
        'style/jsx-quotes': ['error', 'prefer-single'],

        'style/linebreak-style': ['error', 'unix'],
        'style/max-len': [
          'error',
          100,
          2,
          { ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }
        ],
        'style/member-delimiter-style': 'off',
        'style/multiline-ternary': 'off',
        'style/no-tabs': 'error',
        'style/operator-linebreak': 'off',
        'style/quote-props': 'off',
        'style/quotes': ['error', 'single', { allowTemplateLiterals: true }],
        'style/semi': ['error', 'always']
      }
    });
  }

  configs.unshift({
    name: 'siberiacancode/css',
    plugins: {
      'siberiacancode-css': pluginCss
    },
    rules: {
      ...Object.entries(pluginCss.configs.recommended.rules).reduce<Linter.RulesRecord>(
        (acc, [key, value]) => {
          acc[key.replace('css', 'siberiacancode-css')] = value;
          return acc;
        },
        {}
      )
    }
  });

  configs.unshift({
    name: 'siberiacancode',
    plugins: {
      siberiacancode: siberiacancodePlugin
    },
    rules: {
      'siberiacancode/function-component-definition': [
        'error',
        {
          namedComponents: ['arrow-function']
        }
      ],
      'siberiacancode/no-unused-class': 'error'
    }
  });

  return antfu(
    {
      ...options,
      stylistic,
      ...(typescript === 'engine'
        ? {
            typescript: {
              tsconfigPath: path.resolve(process.cwd(), 'tsconfig.json')
            }
          }
        : typescript)
    },
    {
      name: 'siberiacancode/rewrite',
      rules: {
        'antfu/curly': 'off',
        'antfu/if-newline': 'off',
        'antfu/top-level-function': 'off',

        'no-console': 'warn',

        'react/prefer-namespace-import': 'off',
        'react-hooks/exhaustive-deps': 'off',

        'test/prefer-lowercase-title': 'off'
      }
    },
    {
      name: 'siberiacancode/sort',
      rules: {
        'perfectionist/sort-array-includes': [
          'error',
          {
            order: 'asc',
            type: 'alphabetical'
          }
        ],
        'perfectionist/sort-imports': [
          'error',
          {
            groups: [
              'type-import',
              ['value-builtin', 'value-external'],
              'type-internal',
              'value-internal',
              ['type-parent', 'type-sibling', 'type-index'],
              ['value-parent', 'value-sibling', 'value-index'],
              'side-effect',
              'side-effect-style',
              'ts-equals-import',
              'unknown'
            ],
            internalPattern: ['^~/.+', '^@/.+'],
            newlinesBetween: 1,
            order: 'asc',
            type: 'natural'
          }
        ],
        'perfectionist/sort-interfaces': [
          'error',
          {
            groups: ['property', 'member', 'method', 'index-signature'],
            order: 'asc',
            type: 'alphabetical'
          }
        ],
        'perfectionist/sort-jsx-props': [
          'error',
          {
            customGroups: [
              {
                groupName: 'reserved',
                elementNamePattern: '^(key|ref)$'
              },
              {
                groupName: 'callback',
                elementNamePattern: '^on[A-Z].*'
              }
            ],
            groups: ['shorthand-prop', 'reserved', 'multiline-prop', 'unknown', 'callback'],
            order: 'asc',
            type: 'alphabetical'
          }
        ],
        'perfectionist/sort-union-types': [
          'error',
          {
            groups: [
              'conditional',
              'function',
              'import',
              'intersection',
              'keyword',
              'literal',
              'named',
              'object',
              'operator',
              'tuple',
              'union',
              'nullish'
            ],
            order: 'asc',
            specialCharacters: 'keep',
            type: 'alphabetical'
          }
        ]
      }
    },
    ...configs
  );
};
