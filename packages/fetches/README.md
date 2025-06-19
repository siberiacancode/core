# 🔮 fetches

A lightweight and flexible HTTP client for making API requests, inspired by Axios.

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

### Using Predefined Parse Modes

```typescript
const response = await fetches.get('/users', { parse: 'json' });
```

### Custom Parse Functions

You can provide a custom function that takes a Response object and returns a Promise with parsed data. This is useful for handling special response formats or custom parsing logic.

```typescript
const response = await fetches.get('/users', { parse: (data) => data.json() });
```

### Raw response

To get the raw response body without any parsing, use the `'raw'` parse mode. This is useful when you need to handle the response manually or when working with binary data.

```typescript
const response = await fetches.get('/binary-file', { parse: 'raw' });
```
