import { functionComponentDefinition } from './rules/function-component-definition';
import { preferTacit } from './rules/prefer-tacit';

const version = '1.0.0';

export const siberiacancodePlugin = {
  meta: {
    name: '@siberiacancode/eslint-plugin',
    version
  },
  rules: {
    'function-component-definition': functionComponentDefinition,
    'prefer-tacit': preferTacit
  }
};
