// TEST CONFIG

import type { OpenApi, OpenApiOperationObject } from '@hey-api/openapi-ts';

import fs from 'node:fs';

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from './dist/esm/index.mjs';
// import { apicraft } from '@siberiacancode/apicraft';

const apicraftConfig = apicraft([
  {
    // input: 'example-apiv2.json',
    input: () => {
      const content = fs.readFileSync('example-apiv2.json', 'utf8');
      const document: OpenApi.V3_0_X = JSON.parse(content);

      for (const pathItem of Object.values(document.paths)) {
        for (const field of Object.values(pathItem)) {
          const operation = field as OpenApiOperationObject.V3_0_X;
          if (!Array.isArray(operation.parameters)) continue;

          operation.parameters = operation.parameters.filter(
            (parameter) => parameter.name.toLowerCase() !== 'authorization'
          );
        }
      }

      return document;
    },
    output: 'generated/apiV1',
    instance: 'fetches',
    nameBy: 'path',
    groupBy: 'tag',
    plugins: ['tanstack'],
    parser: {
      filters: {
        parameters: {
          exclude: ['Authorization']
        }
      }
    }
  }
]);

export default apicraftConfig;
