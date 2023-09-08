/** @type {import('eslint').Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    'airbnb-base',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
    'plugin:prettier/recommended'
  ],
  plugins: ['simple-import-sort', 'prettier'],
  ignorePatterns: ['dist', 'coverage'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    'max-len': 'off',
    'consistent-return': 'off',
    'no-shadow': 'off',
    'no-param-reassign': 'warn',
    'no-console': ['warn', { allow: ['info', 'error'] }],
    'sort-imports': 'off',
    'import/order': 'off',
    'import/extensions': 'off',
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': 'off',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': [
      'error',
      {
        groups: [
          // External packages:
          ['^react', '^@?\\w'],
          // Internal packages:
          ['^@(koronapay-core/.*|$)'],
          // Alias imports:
          ['^@(([\\/.]?\\w)|assets|test-utils)'],
          // Side effect imports:
          ['^\\u0000'],
          // Parent imports:
          ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
          // Other relative imports:
          ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
          // Style imports:
          ['^.+\\.s?css$']
        ]
      }
    ],
    'require-await': 'error'
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: './tsconfig.json'
      },
      extends: [
        'airbnb-typescript/base',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:prettier/recommended'
      ],
      settings: {
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx']
        },
        'import/resolver': {
          typescript: {
            project: './tsconfig.json'
          }
        }
      },
      rules: {
        'import/order': 'off',
        'import/extensions': 'off',
        'import/prefer-default-export': 'off',
        'import/no-extraneous-dependencies': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-shadow': 'off',
        '@typescript-eslint/restrict-template-expressions': [
          'warn',
          { allowBoolean: true, allowNullish: true }
        ],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', disallowTypeAnnotations: false }
        ],
        'require-await': 'off',
        '@typescript-eslint/require-await': 'error'
      }
    }
  ]
};
