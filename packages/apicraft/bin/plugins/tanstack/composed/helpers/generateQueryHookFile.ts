import type { IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';

import {
  capitalize,
  getApicraftTypeImport,
  getImportInstance,
  getImportRequest
} from '@/bin/plugins/helpers';
import { getQueryHook, getTanstackImport } from '@/bin/plugins/tanstack/helpers';

import type { TanstackPlugin } from '../../types';

interface GenerateQueryHookParams {
  plugin: TanstackPlugin['Instance'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestName: string;
}

export const generateQueryHookFile = ({
  plugin,
  request,
  requestName,
  requestFilePath
}: GenerateQueryHookParams) => {
  const hookName = `use${capitalize(requestName)}Query`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
  });

  // import type { TanstackQuerySettings } from '@siberiacancode/apicraft';
  hookFile.add(getApicraftTypeImport('TanstackQuerySettings'));

  // import { useQuery } from '@tanstack/react-query';
  hookFile.add(getTanstackImport('useQuery'));

  if (plugin.config.groupBy === 'class') {
    // import { instance } from '../../instance.gen';
    hookFile.add(
      getImportInstance({
        output: plugin.output,
        folderPath: hookFolderPath,
        generateOutput: plugin.config.generateOutput
      })
    );
  }
  if (plugin.config.groupBy === 'paths' || plugin.config.groupBy === 'tags') {
    // import type { requestName } from './requestName.gen';
    hookFile.add(
      getImportRequest({
        folderPath: hookFolderPath,
        requestFilePath,
        requestName,
        generateOutput: plugin.config.generateOutput
      })
    );
  }

  // const requestNameQueryKey = requestName;
  // const useRequestNameQuery = (settings: TanstackQuerySettings<typeof requestName>) => useQuery
  hookFile.add(...getQueryHook({ hookName, request, plugin, requestName }));
};
