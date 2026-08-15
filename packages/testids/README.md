# 🔮 testids

Generate, validate and strip test ids from one YAML schema.

## Installation

```bash
npm install @siberiacancode/testids
```

## Schema

```yaml
# testids.yaml
clickable:
  button:
    - next
    - prev
changeable:
  input:
    - email
```

Top-level names are yours to choose.

```ts
export const TESTIDS = {
  clickable: { button: { next: 'clickable-button-next', prev: 'clickable-button-prev' } },
  changeable: { input: { email: 'changeable-input-email' } }
} as const;
```

```tsx
<button data-testid={TESTIDS.clickable.button.next}>next</button>
```

## CLI

| command            | what it does                               |
| ------------------ | ------------------------------------------ |
| `testids generate` | write the constants file from the schema   |
| `testids validate` | check naming, separators and duplicate ids |
| `testids check`    | report constant paths that are never used  |

Every command shares these flags:

| flag              | default                    | description                                 |
| ----------------- | -------------------------- | ------------------------------------------- |
| `-i, --input`     | `testids.yaml`             | schema file                                 |
| `-o, --output`    | `src/constants/testids.ts` | generated file                              |
| `-n, --name`      | `TESTIDS`                  | exported constant name                      |
| `-s, --separator` | `-`                        | separator between segments                  |
| `-c, --case`      | `preserve`                 | id casing: `lower` \| `preserve` \| `upper` |

`generate` adds `--strict` (on by default) — fail on validation errors. Pass `--no-strict` to write anyway.

`check` adds:

| flag        | default                             | description                         |
| ----------- | ----------------------------------- | ----------------------------------- |
| `--files`   | `**/*.{ts,tsx,js,jsx,vue,svelte,…}` | globs to scan for references        |
| `--ignore`  | —                                   | extra globs to ignore               |
| `--verbose` | `false`                             | list the files each id was found in |
| `--strict`  | `false`                             | exit 1 when any id is unused        |

```bash
testids generate -i config/testids.yaml -o src/testids.ts -n TID
testids check --files "src/**/*.tsx" "e2e/**/*.ts" --strict
```

`check` counts references to `TESTIDS.*` paths, so it works with any framework —
React, Playwright, Cypress, whatever. Parent and dynamic access count as usage of
the whole branch:

```ts
const buttons = TESTIDS.clickable.button; // every button id counts as used
const input = TESTIDS.changeable.input[name];
```

## Vite

```ts
import testids from '@siberiacancode/testids/vite';

export default {
  plugins: [testids()]
};
```

- **dev** — regenerates the constants on schema change, keeps `data-testid` in the DOM
- **build** — strips `data-testid` from the output (parsed with Oxc, no Babel)

| option      | default                    | description              |
| ----------- | -------------------------- | ------------------------ |
| `input`     | `testids.yaml`             | schema file              |
| `output`    | `src/constants/testids.ts` | generated file           |
| `name`      | `TESTIDS`                  | exported constant name   |
| `attribute` | `data-testid`              | attribute to strip       |
| `include`   | `/\.[jt]sx$/`              | files to strip           |
| `strip`     | build only                 | remove the attribute     |
| `generate`  | `true`                     | write the constants file |
