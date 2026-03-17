// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV1.yaml',
    output: 'generated/axios-class',
    instance: 'axios',
    baseUrl: '/api',
    nameBy: 'path',
    groupBy: 'class'
  },
  {
    input: 'example-apiV1.yaml',
    output: 'generated/axios-class-runtime',
    instance: { name: 'axios', runtimeInstancePath: './src/instance' },
    baseUrl: '/api',
    nameBy: 'path',
    groupBy: 'class'
  }
  // {
  //   input: 'example-apiV2.yaml',
  //   output: 'generated/axios-standalone',
  //   instance: 'fetches',
  //   nameBy: 'path',
  //   groupBy: 'standalone',
  //   plugins: ['tanstack']
  // },
  // {
  //   input: 'example-apiV2.yaml',
  //   output: 'generated/ofetch-standalone',
  //   instance: 'ofetch',
  //   nameBy: 'path',
  //   groupBy: 'standalone',
  //   plugins: ['tanstack']
  // }
]);

export default apicraftConfig;
