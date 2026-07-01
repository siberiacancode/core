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

import { DEFAULT_REQUEST_ERROR_TYPE_NAME } from '../../constants';
import {
  getHookDataType,
  getQueryHook,
  getTanstackImport,
  getTanstackTypeImport
} from '../../helpers';

interface GenerateQueryHookParams {
  plugin: TanstackPlugin['Instance'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestInfo: GetRequestInfoResult;
  requestName: string;
}

export const generateQueryHookFile = ({
  plugin,
  requestFilePath,
  requestInfo,
  requestName,
  request
}: GenerateQueryHookParams) => {
  const hookName = `use${capitalize(requestName)}Query`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
  });

  // import type { UseQueryOptions, DefaultError } from '@tanstack/react-query';
  hookFile.add(
    getTanstackTypeImport([
      'UseQueryOptions',
      ...(!requestInfo.hasErrorResponse ? [DEFAULT_REQUEST_ERROR_TYPE_NAME] : [])
    ])
  );

  // import { queryOptions, useQuery } from '@tanstack/react-query';
  hookFile.add(getTanstackImport(['queryOptions', 'useQuery']));

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

  // const requestNameQueryKey = "requestNameQueryKey";
  // const requestNameQueryOptions = <TData = RequestNameHookData, TError = ...>(settings) => queryOptions({...})
  // const useRequestNameQuery = <TData = RequestNameHookData, TError = ...>(...args) => useQuery(...)
  hookFile.add(
    ...getQueryHook({
      hookName,
      optionsFunctionName: `${requestName}QueryOptions`,
      plugin,
      requestErrorTypeName,
      requestInfo,
      requestName
    })
  );
};
