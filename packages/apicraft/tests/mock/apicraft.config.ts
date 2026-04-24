import type { ApicraftOption } from '@/bin/schemas';

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from '../../dist/esm/index.mjs';

export const options: ApicraftOption[] = [];
for (const instance of ['axios', 'fetches', 'ofetch'] as const) {
  for (const runtimeInstance of [true, false]) {
    for (const groupBy of ['paths', 'tags', 'class', 'standalone'] as const) {
      for (const nameBy of ['operationId', 'path'] as const) {
        options.push({
          input: 'spec.yaml',
          output: `generated/${instance}${runtimeInstance ? '/runtime' : ''}/${groupBy}/${nameBy}`,
          instance: {
            name: instance,
            ...(runtimeInstance && { runtimeInstancePath: './runtime-instance' })
          },
          baseUrl: '/api',
          groupBy,
          nameBy,
          plugins: ['tanstack']
        });
      }
    }
  }
}

options.push({
  input: 'spec.yaml',
  output: `generated/faker`,
  baseUrl: '/api',
  plugins: [{ name: 'faker', runtimeInstancePath: './faker-instance' }]
});

export default apicraft(options);
