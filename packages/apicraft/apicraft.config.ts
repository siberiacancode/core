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
    groupBy: 'paths',
    plugins: ['reatom', 'tanstack']
  },
  {
    input: 'example-apiV1.yaml',
    output: 'generated/axios-class-runtime',
    instance: { name: 'axios', runtimeInstancePath: './src/instance' },
    baseUrl: '/api',
    nameBy: 'path',
    groupBy: 'class',
    plugins: ['tanstack']
  }
]);

export default apicraftConfig;
