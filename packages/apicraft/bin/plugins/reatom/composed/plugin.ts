import { generateRequestName, getRequestFilePath } from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../types';

import { generateReatomFile } from './helpers';

export const composedHandler: ReatomPlugin['Handler'] = ({ plugin }) =>
  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

    const requestFilePath = getRequestFilePath({
      groupBy: plugin.config.groupBy,
      output: plugin.output,
      requestName,
      request
    });

    generateReatomFile({ plugin, request, requestFilePath, requestName });
  });
