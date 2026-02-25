// TEST CONFIG

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV2-class',
    instance: 'axios',
    nameBy: 'path',
    groupBy: 'paths',
    plugins: ['tanstack']
  },
  {
    input: 'example-apiV2.yaml',
    output: 'generated/apiV2-class-runtime-instance',
    instance: { name: 'axios', runtimeInstancePath: 'src/test-runtime' },
    nameBy: 'path',
    groupBy: 'class',
    plugins: ['tanstack']
  }
]);

export default apicraftConfig;
