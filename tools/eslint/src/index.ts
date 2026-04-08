import type {
  Awaitable,
  ConfigNames,
  OptionsConfig,
  OptionsOverrides,
  OptionsTypescript,
  TypedFlatConfigItem
} from '@antfu/eslint-config';
import type { Linter } from 'eslint';
import type { FlatConfigComposer } from 'eslint-flat-config-utils';

import antfu from '@antfu/eslint-config';
import pluginCss from '@eslint/css';
import pluginBetterTailwindcss from 'eslint-plugin-better-tailwindcss';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginPlaywright from 'eslint-plugin-playwright';

import { siberiacancodePlugin } from './plugin/index';

export interface OptionsPlaywright extends OptionsOverrides {
  patterns?: string[];
}

export interface TailwindSettings {
  detectComponentClasses?: boolean;
  entryPoint?: string;
  messageStyle?: 'compact' | 'raw' | 'visual';
  rootFontSize?: number;
  selectors?: unknown[];
  tailwindConfig?: string;
  tsconfig?: string;
}

export interface OptionsTailwind extends OptionsOverrides {
  settings?: TailwindSettings;
}

type EslintOptions = OptionsConfig &
  TypedFlatConfigItem & {
    jsxA11y?: boolean;
    playwright?: boolean | OptionsPlaywright;
    tailwind?: boolean | OptionsTailwind;
    typescript?: boolean | 'engine' | OptionsTypescript;
  };

export type Eslint = (
  options?: EslintOptions,
  ...userConfigs: Awaitable<
    FlatConfigComposer<any, any> | Linter.Config[] | TypedFlatConfigItem | TypedFlatConfigItem[]
  >[]
) => FlatConfigComposer<TypedFlatConfigItem, ConfigNames>;

export const eslint: Eslint = (inputOptions = {} as EslintOptions, ...configs) => {
  const {
    jsxA11y = false,
    playwright = false,
    tailwind = false,
    typescript = false,
    ...options
  } = inputOptions;

  const stylistic = options.stylistic ?? false;

  if (typescript === 'engine') {
    configs.unshift({
      name: 'siberiacancode/typescript',
      files: ['**/*.?([cm])ts', '**/*.?([cm])tsx'],
      languageOptions: {
        parserOptions: {
          projectService: true
        }
      },
      rules: {
        ...(options.react && { 'react/no-leaked-conditional-rendering': 'error' }),
        'ts/promise-function-async': 'off',
        'ts/strict-boolean-expressions': 'off',
        'ts/no-unnecessary-condition': 'error',
        'ts/no-namespace': 'off',
        'ts/no-floating-promises': 'off',
        'ts/no-misused-promises': ['error', { checksVoidReturn: false }],
        'ts/no-empty-object-type': 'warn',
        'ts/unbound-method': 'off'
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
      ...(typeof playwright === 'object' && { files: playwright.patterns }),
      plugins: {
        'siberiacancode-playwright': pluginPlaywright
      },
      rules: {
        ...Object.entries(playwrightRules).reduce<Linter.RulesRecord>((acc, [key, value]) => {
          acc[key.replace('playwright', 'siberiacancode-playwright')] = value;
          return acc;
        }, {}),
        'siberiacancode-playwright/expect-expect': 'off'
      }
    });
  }

  if (tailwind) {
    const tailwindRules = pluginBetterTailwindcss.configs.recommended.rules as Linter.RulesRecord;

    configs.unshift({
      name: 'siberiacancode/tailwind',
      plugins: {
        'siberiacancode-tailwind': pluginBetterTailwindcss
      },
      rules: {
        ...Object.entries(tailwindRules).reduce<Linter.RulesRecord>((acc, [key, value]) => {
          acc[key.replace('better-tailwindcss', 'siberiacancode-tailwind')] = value;
          return acc;
        }, {}),
        'siberiacancode-tailwind/enforce-consistent-line-wrapping': 'off'
      },
      settings: {
        'better-tailwindcss': {
          entryPoint: 'src/global.css'
        }
      },
      ...(typeof tailwind === 'object' && {
        settings: {
          'better-tailwindcss': tailwind.settings
        }
      })
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
      ]
    }
  });

  return antfu(
    {
      ...options,
      stylistic,
      ...(typescript === 'engine'
        ? { typescript: { tsconfigPath: './tsconfig.json' } }
        : { typescript })
    },
    {
      name: 'siberiacancode/rewrite',
      rules: {
        'antfu/if-newline': 'off',
        'antfu/top-level-function': 'off',

        'no-console': 'warn',
        'prefer-template': 'error',
        'arrow-body-style': ['error', 'as-needed'],

        'unicorn/no-typeof-undefined': 'error',
        'unicorn/no-useless-spread': 'warn',

        'e18e/prefer-static-regex': 'off',
        'e18e/prefer-array-at': 'off',

        'import/newline-after-import': 'error',

        'react/prefer-namespace-import': 'off',
        'react-hooks/exhaustive-deps': 'off',
        'react-refresh/only-export-components': 'off',

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
              'style',
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
    {
      name: 'siberiacancode/disable/markdown',
      files: ['**/*.md'],
      rules: {
        'perfectionist/sort-imports': 'off'
      }
    },
    ...configs
  );
};
