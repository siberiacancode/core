# 🔮 lefthook

A shared lefthook configuration and git hooks. Replaces husky and lint-staged.

## Installation

```bash
npm install @siberiacancode/lefthook
```

## Usage

```yaml
# lefthook.yml
extends:
  - node_modules/@siberiacancode/lefthook/lefthook.yml
```

```json
{
  "scripts": {
    "prepare": "lefthook install"
  }
}
```

## Hooks

| hook | what it does |
| --- | --- |
| `pre-commit` | runs prettier and eslint on staged files |
| `pre-push` | asks to confirm changed `tests/**/*.png` screenshots |
| `commit-msg` | prefixes the message with `<branch> <emoji>` |

The emoji comes from `git config user.emoji` and defaults to 🧊.

## Overriding

```yaml
extends:
  - node_modules/@siberiacancode/lefthook/lefthook.yml

pre-commit:
  jobs:
    - name: format
      skip: true
```
