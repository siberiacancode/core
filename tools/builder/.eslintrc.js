const { eslint } = require('@siberiacancode/eslint');

module.exports = {
  ...eslint.node,
  parserOptions: {
    ...eslint.node.parserOptions,
    tsconfigRootDir: __dirname
  },
  overrides: [
    ...eslint.node.overrides,
    {
      files: ['*.ts'],
      rules: {
        'no-restricted-syntax': 'off'
      }
    }
  ]
};
