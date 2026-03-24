import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'pet-store.yaml',
  output: 'generated/hey-api',
  plugins: ['@hey-api/client-axios', '@tanstack/react-query']
});
