# 🔮 apicraft

Generate types, requests and hooks for your API with one command.

## Installation

```bash
npm install @siberiacancode/apicraft
```

## Usage

Create `apicraft.config.ts`:

```typescript
import { apicraft } from '@siberiacancode/apicraft';

export default apicraft([
  {
    input: 'api.yaml',
    output: 'generated/api',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'tag'
  }
]);
```

```bash
apicraft generate
```

## CLI

### generate

```bash
apicraft generate
```

- `--input, -i` - Path to input OpenAPI specification file (YAML or JSON)
- `--output, -o` - Path to output folder for generated files

## Client Instances

Apicraft supports two HTTP client instances:

### Fetches

Uses `@siberiacancode/fetches` for making requests:

```json
{
  "input": "api.yaml",
  "output": "generated/api",
  "instance": "fetches"
}
```

### Axios

Uses `axios` for making requests:

```json
{
  "input": "api.yaml",
  "output": "generated/api",
  "instance": "axios"
}
```

## Plugins

### TanStack Query Plugin

Generate React Query query, mutations and options for your API requests:

```json
{
  "input": "api.yaml",
  "output": "generated/api",
  "instance": "fetches",
  "plugins": ["tanstack"]
}
```
