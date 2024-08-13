import antfu from '@antfu/eslint-config';
import pluginReact from 'eslint-plugin-react';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import pluginJsxA11y from 'eslint-plugin-jsx-a11y';

/** @type {import('@siberiacancode/eslint').Eslint} */
export const eslint = (...args) =>
  antfu(
    {
      react: true,
      typescript: true,
      jsx: true
    },
    {
      name: 'siberiacancode/rewrite',
      rules: {
        'style/semi': 'off',
        'style/jsx-one-expression-per-line': 'off',
        'style/member-delimiter-style': 'off',
        'style/jsx-quotes': ['error', 'prefer-single'],
        'style/comma-dangle': 'off',
        'style/arrow-parens': 'off',
        'style/quote-props': 'off',

        'antfu/top-level-function': 'off',
        'antfu/if-newline': 'off',
        'antfu/curly': 'off',

        'react-hooks/exhaustive-deps': 'off',

        'test/prefer-lowercase-title': 'off',

        'no-console': 'warn'
      }
    },
    {
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
    ...args.reduce((acc, config) => {
      if (config['jsx-a11y']) {
        acc.push({
          ...pluginJsxA11y.flatConfigs.recommended,
          name: 'siberiacancode/jsx-a11y'
        });
        return acc;
      }

      acc.push({
        ...config,
        name: `siberiacancode/${config.name}`
      });

      return acc;
    }, [])
  );
