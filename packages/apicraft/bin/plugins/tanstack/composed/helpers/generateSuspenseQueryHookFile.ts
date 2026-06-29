import type { IR } from '@hey-api/openapi-ts';

import nodePath from 'node:path';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';

import {
  capitalize,
  getApicraftTypeImport,
  getImportInstance,
  getImportRequest,
  getImportTypes,
  getRequestErrorTypeName
} from '@/bin/plugins/helpers';

import type { TanstackPlugin } from '../../types';

import {
  getHookDataType,
  getSuspenseQueryHook,
  getTanstackImport,
  getTanstackTypeImport
} from '../../helpers';

const DEFAULT_REQUEST_ERROR_TYPE_NAME = 'DefaultError';

interface GenerateSuspenseQueryHookParams {
  plugin: TanstackPlugin['Instance'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestInfo: GetRequestInfoResult;
  requestName: string;
}

export const generateSuspenseQueryHookFile = ({
  plugin,
  requestFilePath,
  requestInfo,
  requestName,
  request
}: GenerateSuspenseQueryHookParams) => {
  const hookName = `use${capitalize(requestName)}SuspenseQuery`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
  });

  // import type { UseSuspenseQueryOptions, DefaultError } from '@tanstack/react-query';
  hookFile.add(
    getTanstackTypeImport([
      'UseSuspenseQueryOptions',
      ...(!requestInfo.hasErrorResponse ? [DEFAULT_REQUEST_ERROR_TYPE_NAME] : [])
    ])
  );

  // import type { UnwrapPromise } from '@siberiacancode/apicraft';
  hookFile.add(getApicraftTypeImport(['UnwrapPromise']));

  // import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
  hookFile.add(getTanstackImport(['queryOptions', 'useSuspenseQuery']));

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

  // type RequestNameHookData = UnwrapPromise<ReturnType<typeof requestName>>;
  hookFile.add(getHookDataType({ requestName, plugin }));

  // const requestNameSuspenseQueryKey = "requestNameSuspenseQueryKey";
  // const requestNameSuspenseQueryOptions = <TData = RequestNameHookData, TError = ...>(settings) => queryOptions({...})
  // const useRequestNameSuspenseQuery = <TData = RequestNameHookData, TError = ...>(...args) => useSuspenseQuery(...)
  hookFile.add(
    ...getSuspenseQueryHook({
      hookName,
      optionsFunctionName: `${requestName}SuspenseQueryOptions`,
      plugin,
      requestErrorTypeName,
      requestInfo,
      requestName
    })
  );
};
