// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/src/index.js';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV1.yaml',
    output: 'generated/apiV1',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'path',
    hooks: 'tanstack'
  },
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV2',
    instance: 'fetches',
    nameBy: 'operationId',
    groupBy: 'tag',
    hooks: 'tanstack'
  }
]);

export default apicraftConfig;
