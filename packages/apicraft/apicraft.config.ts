// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV2-class',
    instance: 'ofetch',
    nameBy: 'path',
    groupBy: 'tags'
  },
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV3-class',
    instance: 'ofetch',
    nameBy: 'path',
    groupBy: 'class'
  }
]);

export default apicraftConfig;
