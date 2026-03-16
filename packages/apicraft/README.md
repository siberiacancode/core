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

Then use:

```bash
npx apicraft generate
```

## CLI

### generate

```bash
npx apicraft generate
```

- `--input, -i` - Path to input OpenAPI specification file (YAML or JSON)
- `--output, -o` - Path to output folder for generated files
- `--config, -c` - Path to a specific `apicraft.config.(js|ts)` file

## Configuration

Apicraft consumes an array of options exported from `apicraft.config.ts`.

### `baseUrl`

`baseUrl` lets you describe the path prefix that every request should strip while generating the
client. This is particularly useful when a reverse-proxy rewrites the upstream path.

```ts
import { apicraft } from '@siberiacancode/apicraft';

export default apicraft([
  {
    input: 'api.yaml',
    output: 'generated/api',
    baseUrl: '/api', // drop /api when generating request paths
    instance: 'fetches'
  }
]);
```

### `runtimeInstance`

Set the `instance` option to an object to keep using an HTTP client you already initialize at runtime
while still benefiting from generated request helpers. The `runtimeInstancePath` is an import that apicraft will use instead of creating a new instance.

```ts
export default apicraft([
  {
    input: 'api.yaml',
    output: 'generated/api',
    baseUrl: '/api',
    instance: {
      name: 'axios',
      runtimeInstancePath: './src/lib/http/axiosInstance' // must export { instance }
    }
  }
]);
```

## Client Instances

Apicraft supports three HTTP client instances:

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

### Ofetch

Uses `ofetch` for making requests:

```json
{
  "input": "api.yaml",
  "output": "generated/api",
  "instance": "ofetch"
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

## Request return types

Every generated request returns the global return type exposed by
`@siberiacancode/apicraft`. You can define your own type globally for your needs:

```ts
declare global {
  interface ApicraftAxiosResponse<Data = never, Error = never> extends Omit<AxiosResponse, 'data'> {
    data: Data | Error;
  }
}
```
