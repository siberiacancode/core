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
  page: number;
  limit: number;
}

const getUsers: ApiFetchesRequest<GetUsersParams, any[]> = ({ params, config }) =>
  fetches.get('/users', {
    ...config,
    params: { ...config?.params, ...params }
  });
```
