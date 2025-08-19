// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { defineConfig } from './dist/src/index.js';
// import { defineConfig } from '@siberiacancode/apicraft';

const apicraftConfig = defineConfig([
  {
    input: './example-apiV1.yaml',
    output: './generated/apiV1',
    types: true,
    axios: true
  },
  {
    input: './example-apiV2.yaml',
    output: './generated/apiV2',
    types: true,
    axios: true
  }
]);

export default apicraftConfig;
