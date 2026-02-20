// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV1',
    instance: 'axios/class',
    nameBy: 'path',
    groupBy: 'tag',
    plugins: ['tanstack']
  }
]);

export default apicraftConfig;
