import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true,
    yaml: true
  },
  {
    name: 'siberiacancode/testids/rewrite',
    rules: {
      'no-console': ['warn', { allow: ['info', 'dir', 'warn', 'error'] }],
      'node/prefer-global/process': 'off'
    }
  },
  {
    name: 'siberiacancode/testids/ignores',
    ignores: ['**/*.yaml']
  }
);
