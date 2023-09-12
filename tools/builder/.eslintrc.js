const { eslint } = require('@siberiacancode/eslint');

module.exports = {
  ...eslint.node,
  parserOptions: {
    ...eslint.node.parserOptions,
    tsconfigRootDir: __dirname
  }
};
