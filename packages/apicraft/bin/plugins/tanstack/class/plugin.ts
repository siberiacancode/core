import type ts from 'typescript';

import nodePath from 'node:path';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance,
  getImportTypes,
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

export const classHandler: TanstackPlugin['Handler'] = ({ plugin }) => {
  const hooksFile = plugin.createFile({
    id: 'hooks',
    path: `${plugin.output}/hooks`
  });

  const hooks: ts.Statement[] = [];
  const requestErrorTypeNames: string[] = [];
  let hasDefaultError = false;

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestInfo = getRequestInfo(request);

    let requestErrorTypeName: string;
    if (requestInfo.hasErrorResponse) {
      requestErrorTypeName = `${capitalize(request.id)}Error`;
      requestErrorTypeNames.push(requestErrorTypeName);
    } else {
      requestErrorTypeName = DEFAULT_REQUEST_ERROR_TYPE_NAME;
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
    // import type { UseSuspenseQueryOptions, UseSuspenseQueryResult, UseQueryOptions, UseQueryResult, UseMutationOptions, UseMutationResult, DefaultError } from '@tanstack/react-query';
    getTanstackTypeImport([
      ...[
        'UseSuspenseQueryOptions',
        'UseSuspenseQueryResult',
        'UseQueryOptions',
        'UseQueryResult',
        'UseMutationOptions',
        'UseMutationResult'
      ],
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
    // import { instance } from '../../instance.gen';
    getImportInstance({
      output: plugin.output,
      folderPath: plugin.config.generateOutput,
      generateOutput: plugin.config.generateOutput
    })
  ];

  hooksFile.add(...imports);
  hooksFile.add(...hooks);
};
