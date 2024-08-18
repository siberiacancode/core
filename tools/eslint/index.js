import antfu from '@antfu/eslint-config';
import pluginNext from '@next/eslint-plugin-next';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import pluginSimpleImportSort from 'eslint-plugin-simple-import-sort';

/** @type {import('@siberiacancode/eslint').Eslint} */
export const eslint = ({ jsxA11y = false, next = false, ...options }, ...configs) => {
  const stylistic = options.stylistic ?? false;

  if (next) {
    configs.unshift({
      plugins: {
        'siberiacancode-next': pluginNext
      },
      name: 'siberiacancode/next',
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
      plugins: {
        'siberiacancode-jsx-a11y': pluginJsxA11y
      },
      name: 'siberiacancode/jsx-a11y',
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
      settings: {
        react: {
          version: 'detect'
        }
      },
      rules: {
        ...Object.entries(pluginReact.configs.recommended.rules).reduce((acc, [key, value]) => {
          acc[key.replace('react', 'siberiacancode-react')] = value;
          return acc;
        }, {}),
        'siberiacancode-react/react-in-jsx-scope': 'off',
        'siberiacancode-react/function-component-definition': [
          'error',
          {
            namedComponents: ['arrow-function'],
            unnamedComponents: 'arrow-function'
          }
        ]
      }
    });
  }

  if (stylistic) {
    configs.unshift({
      name: 'siberiacancode/formatter',
      rules: {
        'style/multiline-ternary': 'off',
        'style/jsx-curly-newline': 'off',
        'style/jsx-one-expression-per-line': 'off',
        'style/member-delimiter-style': 'off',
        'style/quote-props': 'off',
        'style/operator-linebreak': 'off',
        'style/brace-style': 'off',

        'style/max-len': [
          'error',
          100,
          2,
          { ignoreComments: true, ignoreStrings: true, ignoreTemplateLiterals: true }
        ],
        'style/quotes': ['error', 'single', { allowTemplateLiterals: true }],
        'style/jsx-quotes': ['error', 'prefer-single'],
        'style/comma-dangle': ['error', 'never'],
        'style/semi': ['error', 'always'],
        'style/indent': ['error', 2, { SwitchCase: 1 }],
        'style/no-tabs': 'error',
        'style/linebreak-style': ['error', 'unix'],
        'style/arrow-parens': ['error', 'always']
      }
    });
  }

  return antfu(
    { ...options, stylistic },
    {
      name: 'siberiacancode/rewrite',
      rules: {
        'antfu/top-level-function': 'off',
        'antfu/if-newline': 'off',
        'antfu/curly': 'off',

        'react-hooks/exhaustive-deps': 'off',

        'test/prefer-lowercase-title': 'off',

        'no-console': 'warn'
      }
    },
    {
      name: 'siberiacancode/imports',
      plugins: {
        'plugin-simple-import-sort': pluginSimpleImportSort
      },
      rules: {
        'sort-imports': 'off',
        'import/order': 'off',
        'import/extensions': 'off',
        'plugin-simple-import-sort/exports': 'error',
        'plugin-simple-import-sort/imports': [
          'error',
          {
            groups: [
              ['^react', '^@?\\w'],
              ['^@(siberiacancode-core/.*|$)'],
              ['^@(([\\/.]?\\w)|assets|test-utils)'],
              ['^\\u0000'],
              ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
              ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
              ['^.+\\.s?css$']
            ]
          }
        ]
      }
    },
    ...configs
  );
};
