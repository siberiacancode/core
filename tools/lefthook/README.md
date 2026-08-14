# @siberiacancode/lefthook

Shared [lefthook](https://lefthook.dev) config and git hooks. Replaces `husky` + `lint-staged`.

`lefthook` itself ships as a dependency — you don't install it separately.

## Install

```bash
pnpm add -D @siberiacancode/lefthook
```

Create `lefthook.yml` in the repo root:

```yaml
extends:
  - node_modules/@siberiacancode/lefthook/dist/lefthook.yml
```

And enable the hooks:

```json
{
  "scripts": {
    "prepare": "lefthook install"
  }
}
```

## What you get

| hook         | job                | what it does                                              |
| ------------ | ------------------ | --------------------------------------------------------- |
| `commit-msg` | `commit-msg`       | prefixes the message with `<branch> <emoji>`               |
| `pre-commit` | `eslint`           | `eslint --fix` on staged js/ts files, restages the result  |
| `pre-commit` | `prettier`         | `prettier --write` on staged files, restages the result    |

The commit emoji comes from `git config user.emoji` and defaults to `🧊`:

```bash
git config user.emoji "🚀"
```

## Overriding

`extends` merges by job name, so you override or disable anything locally:

```yaml
extends:
  - node_modules/@siberiacancode/lefthook/dist/lefthook.yml

pre-commit:
  jobs:
    # turn a shared job off
    - name: prettier
      skip: true
    # add your own
    - name: typecheck
      run: pnpm type
```

Skip hooks for a single commit with `LEFTHOOK=0 git commit ...`.

## Migrating from husky + lint-staged

1. `pnpm remove husky lint-staged`
2. `rm -rf .husky`
3. drop the `lint-staged` block from `package.json` — its job is now the `pre-commit` jobs above
4. swap `"prepare": "husky"` for `"prepare": "lefthook install"`
5. add the `lefthook.yml` shown above

## Exports

```ts
import { hook, LEFTHOOK_CONFIG_PATH, LEFTHOOK_HOOKS_DIR } from '@siberiacancode/lefthook';

LEFTHOOK_CONFIG_PATH; // node_modules/@siberiacancode/lefthook/dist/lefthook.yml
hook('commit-msg'); // node_modules/@siberiacancode/lefthook/dist/hooks/commit-msg.sh
```

Hook scripts are also reachable directly: `@siberiacancode/lefthook/hooks/commit-msg.sh`.
