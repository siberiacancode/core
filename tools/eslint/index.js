import antfu from '@antfu/eslint-config';
import pluginNext from '@next/eslint-plugin-next';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';

/** @type {import('@siberiacancode/eslint').Eslint} */
export const eslint = ({ jsxA11y = false, next = false, ...options }, ...configs) => {
  const stylistic = options?.stylistic ?? false;

  if (next) {
    configs.unshift({
      name: 'siberiacancode/next',
      plugins: {
        'siberiacancode-next': pluginNext
      },
      rules: {
        ...Object.entries({ ...pluginNext.configs.recommended.rules }).reduce(
          (acc, [key, value]) => {
            acc[key.replace('@next/next', 'siberiacancode-next')] = value;
            return acc;
          },
          {}
        )
      }
    });
  }

  if (jsxA11y) {
    configs.unshift({
      name: 'siberiacancode/jsx-a11y',
      plugins: {
        'siberiacancode-jsx-a11y': pluginJsxA11y
      },
      rules: {
        ...Object.entries(pluginJsxA11y.flatConfigs.recommended.rules).reduce(
          (acc, [key, value]) => {
            acc[key.replace('jsx-a11y', 'siberiacancode-jsx-a11y')] = value;
            return acc;
          },
          {}
        )
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
        ...Object.entries(pluginReact.configs.recommended.rules).reduce((acc, [key, value]) => {
          acc[key.replace('react', 'siberiacancode-react')] = value;
          return acc;
        }, {}),
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
              'type',
              ['builtin', 'external'],
              'internal-type',
              ['internal'],
              ['parent-type', 'sibling-type', 'index-type'],
              ['parent', 'sibling', 'index'],
              'object',
              'style',
              'side-effect-style',
              'unknown'
            ],
            internalPattern: ['^~/.*', '^@/.*'],
            newlinesBetween: 'always',
            order: 'asc',
            type: 'natural'
          }
        ],
        'perfectionist/sort-interfaces': [
          'error',
          {
            groups: ['unknown', 'method', 'multiline'],
            order: 'asc',
            type: 'alphabetical'
          }
        ],
        'perfectionist/sort-jsx-props': [
          'error',
          {
            customGroups: {
              callback: 'on*',
              reserved: ['key', 'ref']
            },
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
