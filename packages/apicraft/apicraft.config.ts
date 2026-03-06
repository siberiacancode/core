// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV2.yaml',
    output: 'generated/axios-standalone-runtime',
    instance: { name: 'axios', runtimeInstancePath: 'src/instance' },
    nameBy: 'path',
    groupBy: 'standalone',
    plugins: ['tanstack']
  },
  {
    input: 'example-apiV2.yaml',
    output: 'generated/axios-standalone',
    instance: 'axios',
    nameBy: 'path',
    groupBy: 'standalone',
    plugins: ['tanstack']
  }
]);

export default apicraftConfig;
