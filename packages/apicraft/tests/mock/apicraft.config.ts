import type { ApicraftOption } from '@/bin/schemas';

import { apicraft } from '../../dist/esm/index.mjs';

export const options: ApicraftOption[] = [];
for (const instance of ['axios', 'fetches'] as const) {
  for (const runtimeInstance of [true, false]) {
    for (const groupBy of ['paths', 'tags', 'class'] as const) {
      for (const nameBy of ['operationId', 'path'] as const) {
        options.push({
          input: 'spec.yaml',
          output: `generated/${instance}${runtimeInstance ? '/runtime' : ''}/${groupBy}/${nameBy}`,
          instance: {
            name: instance,
            ...(runtimeInstance && { runtimeInstancePath: '' })
          },
          groupBy,
          nameBy,
          plugins: ['tanstack']
        });
      }
    }
  }
}

export default apicraft(options);
