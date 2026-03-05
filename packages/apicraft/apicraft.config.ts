// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV1.yaml',
    output: 'generated/apiV1-class',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'paths'
  },
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV3-class',
    instance: 'axios',
    nameBy: 'path',
    groupBy: 'class'
  }
]);

export default apicraftConfig;
