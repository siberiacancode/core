import { eslint } from '@siberiacancode/eslint';

export default eslint(
  {
    typescript: true
  },
  {
    name: 'siberiacancode/apicraft/rewrite',
    rules: {
      'no-console': ['warn', { allow: ['info', 'dir', 'warn', 'error'] }],
      'node/prefer-global/process': 'off',
      'no-template-curly-in-string': 'off',
      'ts/no-use-before-define': 'off'
    }
  },
  {
    name: 'siberiacancode/apicraft/ignores',
    ignores: ['generated/**', '**/*.yaml']
  }
);
