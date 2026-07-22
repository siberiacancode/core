// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV1.yaml',
    output: 'generated/axios-class',
    groupBy: 'class',
    plugins: ['faker', { name: '@hey-api/typescript', case: 'PascalCase' }]
  },
  {
    input: 'example-apiV1.yaml',
    output: 'generated/axios-class-runtime',
    instance: { name: 'axios' },
    baseUrl: '/api',
    nameBy: 'path',
    groupBy: 'class',
    plugins: ['tanstack']
  }
]);

export default apicraftConfig;
