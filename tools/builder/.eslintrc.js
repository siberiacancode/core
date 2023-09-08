const { eslint } = require('@siberiacancode-core/eslint');

module.exports = {
  ...eslint.node,
  parserOptions: {
    ...eslint.node.parserOptions,
    tsconfigRootDir: __dirname
  }
};
