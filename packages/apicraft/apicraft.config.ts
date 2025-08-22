// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/src/index.js';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: './example-apiV1.yaml',
    output: './generated/apiV1typesOnly',
    types: true
  },
  {
    input: './example-apiV1.yaml',
    output: './generated/apiV1typesWithAxios',
    types: true,
    axios: true
  },
  {
    input: './example-apiV2.yaml',
    output: './generated/apiV2',
    // TODO: if pass axios, heyapi generate types anyway, so 'types' flag seems useless.
    axios: true
  }
]);

export default apicraftConfig;
