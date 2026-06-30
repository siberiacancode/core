import type { IR } from '@hey-api/openapi-ts';

import nodePath from 'node:path';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';

import {
  capitalize,
  getImportInstance,
  getImportRequest,
  getImportTypes,
  getRequestErrorTypeName
} from '@/bin/plugins/helpers';

import type { TanstackPlugin } from '../../types';

import {
  getHookDataType,
  getMutationHook,
  getTanstackImport,
  getTanstackTypeImport
} from '../../helpers';

const DEFAULT_REQUEST_ERROR_TYPE_NAME = 'DefaultError';

interface GenerateMutationHookFileParams {
  plugin: TanstackPlugin['Instance'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestInfo: GetRequestInfoResult;
  requestName: string;
}

export const generateMutationHookFile = ({
  plugin,
  requestFilePath,
  requestInfo,
  requestName,
  request
}: GenerateMutationHookFileParams) => {
  const hookName = `use${capitalize(requestName)}Mutation`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
  });

  // import type { UseMutationOptions, DefaultError } from '@tanstack/react-query';
  hookFile.add(
    getTanstackTypeImport([
      'UseMutationOptions',
      ...(!requestInfo.hasErrorResponse ? [DEFAULT_REQUEST_ERROR_TYPE_NAME] : [])
    ])
  );

  // import { useMutation } from '@tanstack/react-query';
  hookFile.add(getTanstackImport(['useMutation']));

  let requestErrorTypeName = DEFAULT_REQUEST_ERROR_TYPE_NAME;
  if (requestInfo.hasErrorResponse) {
    requestErrorTypeName = getRequestErrorTypeName(request.id);
    // import type { RequestNameError } from 'generated/types.gen';
    hookFile.add(
      getImportTypes({
        folderPath: hookFolderPath,
        generateOutput: plugin.config.generateOutput,
        typeNames: [requestErrorTypeName]
      })
    );
  }

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

  // type RequestNameHookData = Awaited<ReturnType<typeof requestName>>;
  hookFile.add(getHookDataType({ requestName, plugin }));

  // const requestNameMutationKey = "requestNameMutationKey";
  // type RequestNameMutationVariables = Parameters<typeof requestName>[0];
  // const useRequestNameMutation = <TError = ..., TContext = unknown>(settings) => useMutation({...})
  hookFile.add(...getMutationHook({ hookName, plugin, requestErrorTypeName, requestName }));
};
