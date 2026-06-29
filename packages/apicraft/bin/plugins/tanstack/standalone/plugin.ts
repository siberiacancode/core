import type ts from 'typescript';

import nodePath from 'node:path';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportRequest,
  getImportTypes,
  getRequestErrorTypeName,
  getRequestInfo
} from '@/bin/plugins/helpers';

import type { TanstackPlugin } from '../types';

import {
  getHookDataType,
  getMutationHook,
  getQueryHook,
  getSuspenseQueryHook,
  getTanstackImport,
  getTanstackTypeImport
} from '../helpers';

const DEFAULT_REQUEST_ERROR_TYPE_NAME = 'DefaultError';

export const standaloneHandler: TanstackPlugin['Handler'] = ({ plugin }) => {
  const hooksFile = plugin.createFile({
    id: 'hooks',
    path: `${plugin.output}/hooks`
  });

  const hooks: ts.Statement[] = [];
  const requestErrorTypeNames: string[] = [];
  const requestImportNames: string[] = [];
  let hasDefaultError = false;

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestInfo = getRequestInfo(request);

    requestImportNames.push(requestName);

    let requestErrorTypeName = DEFAULT_REQUEST_ERROR_TYPE_NAME;
    if (requestInfo.hasErrorResponse) {
      requestErrorTypeName = getRequestErrorTypeName(request.id);
      requestErrorTypeNames.push(requestErrorTypeName);
    } else {
      hasDefaultError = true;
    }

    hooks.push(getHookDataType({ requestName, plugin }));
    hooks.push(
      ...getQueryHook({
        hookName: `use${capitalize(requestName)}Query`,
        optionsFunctionName: `${requestName}QueryOptions`,
        requestErrorTypeName,
        plugin,
        requestInfo,
        requestName
      })
    );
    hooks.push(
      ...getMutationHook({
        hookName: `use${capitalize(requestName)}Mutation`,
        requestErrorTypeName,
        plugin,
        requestName
      })
    );
    hooks.push(
      ...getSuspenseQueryHook({
        hookName: `use${capitalize(requestName)}SuspenseQuery`,
        optionsFunctionName: `${requestName}SuspenseQueryOptions`,
        requestErrorTypeName,
        plugin,
        requestInfo,
        requestName
      })
    );
  });

  const hooksFilePath = nodePath.normalize(`${plugin.output}/hooks`);
  const hooksFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hooksFilePath}`);
  const imports: ts.ImportDeclaration[] = [
    // import type { UseSuspenseQueryOptions, UseQueryOptions, UseMutationOptions, DefaultError } from '@tanstack/react-query';
    getTanstackTypeImport([
      ...['UseSuspenseQueryOptions', 'UseQueryOptions', 'UseMutationOptions'],
      ...(hasDefaultError ? [DEFAULT_REQUEST_ERROR_TYPE_NAME] : [])
    ]),
    // import type { UnwrapPromise } from '@siberiacancode/apicraft';
    getApicraftTypeImport(['UnwrapPromise']),
    // import { useQuery, useMutation, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
    getTanstackImport(['useQuery', 'useMutation', 'queryOptions', 'useSuspenseQuery']),
    // import type { Type } from 'generated/types.gen';
    ...(requestErrorTypeNames.length
      ? [
          getImportTypes({
            folderPath: hooksFolderPath,
            generateOutput: plugin.config.generateOutput,
            typeNames: requestErrorTypeNames
          })
        ]
      : []),
    // import type { requestName1, requestName2 } from './requests.gen';
    getImportRequest({
      folderPath: plugin.config.generateOutput,
      generateOutput: plugin.config.generateOutput,
      requestFilePath: `${plugin.output}/requests`,
      requestName: requestImportNames
    })
  ];

  hooksFile.add(...imports);
  hooksFile.add(...hooks);
};
