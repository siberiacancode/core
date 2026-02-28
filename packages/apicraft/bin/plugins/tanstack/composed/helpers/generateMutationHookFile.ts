import type { DefinePlugin } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';

import {
  capitalize,
  getApicraftTypeImport,
  getImportInstance,
  getImportRequest
} from '@/bin/plugins/helpers';

import type { TanstackPluginConfig } from '../../types';

import { getMutationHook, getTanstackImport } from '../../helpers';

interface GenerateMutationHookFileParams {
  plugin: Parameters<DefinePlugin<TanstackPluginConfig>['Handler']>[0]['plugin'];
  requestFilePath: string;
  requestName: string;
}

export const generateMutationHookFile = ({
  plugin,
  requestName,
  requestFilePath
}: GenerateMutationHookFileParams) => {
  const hookName = `use${capitalize(requestName)}Mutation`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
  });

  // import type { TanstackMutationSettings } from '@siberiacancode/apicraft';
  hookFile.add(getApicraftTypeImport('TanstackMutationSettings'));

  // import { useMutation } from '@tanstack/react-query';
  hookFile.add(getTanstackImport('useMutation'));

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

  // const requestNameMutationKey = requestName;
  // const useRequestNameMutation = (settings: TanstackMutationSettings<typeof requestName>) => useMutation
  hookFile.add(...getMutationHook({ hookName, plugin, requestName }));
};
