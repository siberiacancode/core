import { generateRequestName, getRequestFilePath } from '@/bin/plugins/helpers';

import type { TanstackPlugin } from '../types';

import {
  generateMutationHookFile,
  generateQueryHookFile,
  generateSuspenseQueryHookFile
} from './helpers';

export const composedHandler: TanstackPlugin['Handler'] = ({ plugin }) =>
  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

    const requestFilePath = getRequestFilePath({
      groupBy: plugin.config.groupBy,
      output: plugin.output,
      requestName,
      request
    });

    generateQueryHookFile({ plugin, requestFilePath, request, requestName });
    generateSuspenseQueryHookFile({ plugin, requestFilePath, request, requestName });
    generateMutationHookFile({ plugin, requestFilePath, requestName });
  });
