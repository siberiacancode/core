import type { TanstackPlugin } from './types';

import { generateRequestName, getRequestFilePaths } from '../helpers';
import {
  generateMutationHookFile,
  generateQueryHookFile,
  generateSuspenseQueryHookFile
} from './helpers';

export const handler: TanstackPlugin['Handler'] = ({ plugin }) => {
  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

    const requestFilePaths = getRequestFilePaths({
      groupBy: plugin.config.groupBy,
      output: plugin.output,
      requestName,
      request
    });

    requestFilePaths.forEach((requestFilePath) => {
      generateQueryHookFile({ plugin, requestFilePath, request, requestName });
      generateSuspenseQueryHookFile({ plugin, requestFilePath, request, requestName });
      generateMutationHookFile({ plugin, requestFilePath, request, requestName });
    });
  });
};
