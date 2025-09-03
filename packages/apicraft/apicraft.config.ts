// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/src/index.js';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: './example-apiV1.yaml',
    output: './generated'
  },
  {
    input: './example-apiV1.yaml',
    output: './generated',
    axios: true
  }
]);

export default apicraftConfig;
