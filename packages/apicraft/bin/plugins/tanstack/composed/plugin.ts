import { generateRequestName, getRequestFilePath, getRequestInfo } from '@/bin/plugins/helpers';

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
    const requestInfo = getRequestInfo(request);

    const requestFilePath = getRequestFilePath({
      groupBy: plugin.config.groupBy,
      output: plugin.output,
      requestName,
      request
    });

    generateQueryHookFile({
      plugin,
      requestFilePath,
      requestInfo,
      requestName,
      request
    });
    generateSuspenseQueryHookFile({
      plugin,
      requestFilePath,
      requestInfo,
      requestName,
      request
    });
    generateMutationHookFile({
      plugin,
      requestFilePath,
      requestInfo,
      requestName,
      request
    });
  });
