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

### `input`

`input` accepts either a direct path/object value or an async/sync function that returns that value.
This is useful when the OpenAPI source needs to be resolved dynamically before generation starts.

```ts
import { apicraft } from '@siberiacancode/apicraft';

export default apicraft([
  {
    input: async () => {
      const schema = await getSchema();

      return schema;
    },
    // input: 'api.yaml',
    // input: 'http://api.example.com/api.yaml',
    // input: {
    //   version: '3.0.0',
    //   paths: {
    //     '/api/users': {
    //       get: {
    //         operationId: 'getUser'
    //       }
    //     }
    //   }
    // },
    output: 'generated/api',
    instance: 'fetches'
  }
]);
```

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

Also in that file you can define custom request return type/interface that will be used instead of default one:

```ts
export type ApicraftApiResponse<Data, Error> = AxiosResponse<Data | Error>;
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

### Faker Plugin

Generate faker-based schema factories with deep partial merge support:

```json
{
  "input": "api.yaml",
  "output": "generated/api",
  "instance": "fetches",
  "plugins": ["faker"]
}
```

Generated API example:

```ts
createUser({ profile: { firstName: 'John' } });
```

You can also provide your own faker instance created with `new Faker(...)`:

```json
{
  "plugins": [
    {
      "name": "faker",
      "runtimeFakerInstancePath": "./src/shared/faker-instance"
    }
  ]
}
```
