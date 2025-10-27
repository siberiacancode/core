// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/src/index.js';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV2',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'tag'
  }
]);

export default apicraftConfig;
