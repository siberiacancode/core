import antfu from '@antfu/eslint-config';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';
import pluginReact from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';

/** @type {import('@siberiacancode/eslint').Eslint} */
export const eslint = (options = {}, ...configs) => {
  if (options['jsx-a11y']) {
    configs.push({
      ...pluginJsxA11y.flatConfigs.recommended,
      name: 'siberiacancode/jsx-a11y'
    });
  }

  if (options.react) {
    configs.push({
      name: 'siberiacancode/react',
      plugins: {
        'plugin-react': pluginReact
      },
      settings: {
        react: {
          version: 'detect'
        }
      },
      rules: {
        'plugin-react/function-component-definition': [
          'error',
          {
            namedComponents: ['arrow-function'],
            unnamedComponents: 'arrow-function'
          }
        ]
      }
    });
  }

  return antfu(
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
        'simple-import-sort': simpleImportSort
      },
      rules: {
        'sort-imports': 'off',
        'import/order': 'off',
        'import/extensions': 'off',
        'simple-import-sort/exports': 'error',
        'simple-import-sort/imports': [
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
    {
      name: 'siberiacancode/formatter',
      rules: {
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
    },
    ...configs
  );
};
