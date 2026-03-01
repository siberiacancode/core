import { generateRequestName, getRequestFilePaths } from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../types';

import { generateReatomFile } from './helpers';

export const composedHandler: ReatomPlugin['Handler'] = ({ plugin }) =>
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
      generateReatomFile({ plugin, requestFilePath, request, requestName });
    });
  });
