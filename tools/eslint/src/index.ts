import type {
  Awaitable,
  ConfigNames,
  OptionsConfig,
  TypedFlatConfigItem
} from '@antfu/eslint-config';
import type { Linter } from 'eslint';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';

import antfu from '@antfu/eslint-config';
import pluginNext from '@next/eslint-plugin-next';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';

type EslintOptions = OptionsConfig &
  TypedFlatConfigItem & {
    jsxA11y?: boolean;
    next?: boolean;
  };

export type Eslint = (
  options?: EslintOptions,
  ...userConfigs: Awaitable<
    FlatConfigComposer<any, any> | Linter.Config[] | TypedFlatConfigItem | TypedFlatConfigItem[]
  >[]
) => FlatConfigComposer<TypedFlatConfigItem, ConfigNames>;

export const eslint: Eslint = (inputOptions = {} as EslintOptions, ...configs) => {
  const { jsxA11y = false, next = false, ...options } = inputOptions;
  const stylistic = options?.stylistic ?? false;

  if (next) {
    const nextRules = (pluginNext.configs.recommended.rules as Linter.RulesRecord) ?? {};

    configs.unshift({
      name: 'siberiacancode/next',
      plugins: {
        'siberiacancode-next': pluginNext
      },
      rules: {
        ...Object.entries(nextRules).reduce<Linter.RulesRecord>((acc, [key, value]) => {
          acc[key.replace('@next/next', 'siberiacancode-next')] = value;
          return acc;
        }, {})
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

  if (options.react) {
    configs.unshift({
      name: 'siberiacancode/react',
      plugins: {
        'siberiacancode-react': pluginReact
      },
      rules: {
        ...Object.entries(pluginReact.configs.recommended.rules).reduce<Linter.RulesRecord>(
          (acc, [key, value]) => {
            acc[key.replace('react', 'siberiacancode-react')] = value;
            return acc;
          },
          {}
        ),
        'siberiacancode-react/function-component-definition': [
          'error',
          {
            namedComponents: ['arrow-function'],
            unnamedComponents: 'arrow-function'
          }
        ],
        'siberiacancode-react/prop-types': 'off',
        'siberiacancode-react/react-in-jsx-scope': 'off'
      },
      settings: {
        react: {
          version: 'detect'
        }
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

  return antfu(
    { ...options, stylistic },
    {
      name: 'siberiacancode/rewrite',
      rules: {
        'antfu/curly': 'off',
        'antfu/if-newline': 'off',
        'antfu/top-level-function': 'off',

        'no-console': 'warn',

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
              'unknown'
            ],
            internalPattern: ['^~/.*', '^@/.*'],
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
            groups: ['shorthand', 'reserved', 'multiline', 'unknown', 'callback'],
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
