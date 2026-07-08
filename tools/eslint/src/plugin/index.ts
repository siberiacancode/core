import { functionComponentDefinition } from './rules/function-component-definition';
import { noUselessTemplateLiteral } from './rules/no-useless-template-literal';

const version = '1.0.0';

export const siberiacancodePlugin = {
  meta: {
    name: '@siberiacancode/eslint-plugin',
    version
  },
  rules: {
    'function-component-definition': functionComponentDefinition,
    'no-useless-template-literal': noUselessTemplateLiteral
  }
};
