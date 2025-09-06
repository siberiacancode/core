// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/src/index.js';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV1.yaml',
    output: 'generated/apiV1',
    plugins: [{ name: 'fetches', runtimeInstancePath: 'src/instance' }]
  },
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV2',
    plugins: ['fetches']
  }
]);

export default apicraftConfig;
