import type { ApicraftInstanceName, ApicraftOption } from '@/bin/schemas';

// eslint-disable-next-line antfu/no-import-dist
import { apicraft } from '../../dist/esm/index.mjs';

interface ScenarioConfig {
  groupBy: ApicraftOption['groupBy'];
  instance: ApicraftInstanceName;
  nameBy: ApicraftOption['nameBy'];
  runtimeInstance: boolean;
}

export const configs: ScenarioConfig[] = [];
for (const instance of ['axios', 'fetches'] as const) {
  for (const runtimeInstance of [true, false]) {
    for (const groupBy of ['paths', 'tags', 'class'] as const) {
      for (const nameBy of ['operationId', 'path'] as const) {
        configs.push({
          instance,
          runtimeInstance,
          groupBy,
          nameBy
        });
      }
    }
  }
}

const apicraftConfig = apicraft(
  configs.map((config) => ({
    input: 'spec.yaml',
    output: `generated/${config.instance}${config.runtimeInstance ? '/runtime' : ''}/${config.groupBy}/${config.nameBy}`,
    instance: {
      name: config.instance,
      ...(config.runtimeInstance && { runtimeInstancePath: '' })
    },
    groupBy: config.groupBy,
    nameBy: config.nameBy,
    plugins: ['tanstack']
  }))
);

export default apicraftConfig;
