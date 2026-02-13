// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/src/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV1.yaml',
    output: 'generated/apiV1',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'tag',
    plugins: ['tanstack']
  }
]);

export default apicraftConfig;
