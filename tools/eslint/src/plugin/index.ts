import { functionComponentDefinition } from './rules/function-component-definition';
import { noUnusedClass } from './rules/no-unused-class';

const version = '1.0.0';

export const siberiacancodePlugin = {
  meta: {
    name: '@siberiacancode/eslint-plugin',
    version
  },
  rules: {
    'function-component-definition': functionComponentDefinition,
    'no-unused-class': noUnusedClass
  }
};
