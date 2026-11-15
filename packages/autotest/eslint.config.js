import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true
  },
  {
    name: 'siberiacancode/autotest/rewrite',
    rules: {
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'node/prefer-global/process': 'off'
    }
  }
);
