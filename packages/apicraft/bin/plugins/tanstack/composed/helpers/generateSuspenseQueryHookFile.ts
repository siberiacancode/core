import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';

import {
  capitalize,
  getApicraftTypeImport,
  getImportInstance,
  getImportRequest
} from '@/bin/plugins/helpers';

import type { TanstackPluginConfig } from '../../types';

import { getSuspenseQueryHook, getTanstackImport } from '../../helpers';

interface GenerateSuspenseQueryHookParams {
  plugin: Parameters<DefinePlugin<TanstackPluginConfig>['Handler']>[0]['plugin'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestName: string;
}

export const generateSuspenseQueryHookFile = ({
  plugin,
  request,
  requestName,
  requestFilePath
}: GenerateSuspenseQueryHookParams) => {
  const hookName = `use${capitalize(requestName)}SuspenseQuery`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
  });

  // import type { TanstackSuspenseQuerySettings } from '@siberiacancode/apicraft';
  hookFile.add(getApicraftTypeImport('TanstackSuspenseQuerySettings'));

  // import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
  hookFile.add(getTanstackImport(['queryOptions', 'useSuspenseQuery']));

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

  // const requestNameSuspenseQueryKey = requestName;
  // const requestNameOptions = queryOptions({...})
  // const useRequestNameSuspenseQuery = (settings: TanstackSuspenseQuerySettings<typeof requestName>) => useSuspenseQuery
  hookFile.add(
    ...getSuspenseQueryHook({
      optionsFunctionName: `${requestName}Options`,
      hookName,
      plugin,
      request,
      requestName
    })
  );
};
