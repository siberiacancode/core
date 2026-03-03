// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV1.yaml',
    output: 'generated/issue',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'tags',
    plugins: ['tanstack']
  }
]);

export default apicraftConfig;
