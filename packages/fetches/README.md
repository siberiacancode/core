# 🔮 fetches

A lightweight and flexible HTTP client for making API requests.

## Installation

```bash
npm install @siberiacancode/fetches
```

## Usage

```typescript
import fetches from '@siberiacancode/fetches';

const response = await fetches.get<User[]>('/users');
```

## Custom instance

```typescript
const api = fetches.create({
  baseURL: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    config.headers.Authorization = 'Bearer token';
    return config;
  },
  (error) => Promise.reject(error)
);
```

## Request wrapper

```typescript
interface GetUsersParams {
  limit: number;
  page: number;
}

const getUsers: ApiFetchesRequest<GetUsersParams, any[]> = ({ params, config }) =>
  fetches.get('/users', {
    ...config,
    params: { ...config?.params, ...params }
  });
```

## Response parse

The fetches library provides flexible response parsing options to handle different types of responses. You can specify how to parse the response body using predefined modes or custom functions. If no parse mode is specified, the response will be automatically parsed based on the `Content-Type` header:

```typescript
const response = await fetches.get('/users', { parse: 'json' });
```

### Custom parse functions

You can provide a custom function that takes a Response object and returns a Promise with parsed data. This is useful for handling special response formats or custom parsing logic.

```typescript
const response = await fetches.get('/users', { parse: (data) => data.json() });
```

### Raw response

To get the raw response body without any parsing, use the `'raw'` parse mode. This is useful when you need to handle the response manually or when working with binary data.

```typescript
const response = await fetches.get('/binary-file', { parse: 'raw' });
```

## Base URL

You can set the base URL when creating a new instance:

```typescript
import { Fetches } from '@siberiacancode/fetches';

const api = new Fetches({
  baseURL: '/api'
});

await api.get('/users'); // /api/users
```

You can override the base URL for individual requests using the `baseURL` option:

```typescript
await api.get('/users', { baseUrl: '/api' });
```

## Context

The library supports a context system that allows you to pass data through the entire request lifecycle.

```typescript
const response = await fetches.get('/users', { context: 'data' });

console.log('response', response.options.context); // 'data'
```

## Validate status

By default, only HTTP status codes in the range 2xx are considered successful. Set `validateStatus` when creating the instance (or with `setValidateStatus`): if it returns `true`, the response is treated as success and no error is thrown.

```typescript
// Treat 2xx and 3xx as success
const api = fetches.create({
  baseURL: '/api',
  validateStatus: (status) => status >= 200 && status < 400
});

// Accept 404 as success (e.g. “not found” as valid empty result)
const api = fetches.create({
  baseURL: '/api',
  validateStatus: (status) => (status >= 200 && status < 300) || status === 404
});
```

## Global error handling

You can handle errors globally by setting the response interceptors.

```typescript
const api = fetches.create({
  baseURL: '/api'
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error(error);
    return Promise.reject(error);
  }
);
```
