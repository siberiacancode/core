import type ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportRequest
} from '@/bin/plugins/helpers';

import type { TanstackPlugin } from '../types';

import { getMutationHook, getQueryHook, getSuspenseQueryHook, getTanstackImport } from '../helpers';

export const standaloneHandler: TanstackPlugin['Handler'] = ({ plugin }) => {
  const hooksFile = plugin.createFile({
    id: 'hooks',
    path: `${plugin.output}/hooks`
  });

  const requestImportNames: string[] = [];
  const imports: ts.ImportDeclaration[] = [
    // import { useQuery, useMutation, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
    getTanstackImport(['useQuery', 'useMutation', 'queryOptions', 'useSuspenseQuery']),
    // import type { TanstackQuerySettings, TanstackMutationSettings, TanstackSuspenseQuerySettings } from '@siberiacancode/apicraft';
    getApicraftTypeImport([
      'TanstackQuerySettings',
      'TanstackMutationSettings',
      'TanstackSuspenseQuerySettings'
    ])
  ];

  const hooks: ts.VariableStatement[] = [];

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

    requestImportNames.push(requestName);

    hooks.push(
      ...getQueryHook({
        hookName: `use${capitalize(requestName)}Query`,
        plugin,
        request,
        requestName
      })
    );
    hooks.push(
      ...getMutationHook({
        hookName: `use${capitalize(requestName)}Mutation`,
        plugin,
        requestName
      })
    );
    hooks.push(
      ...getSuspenseQueryHook({
        hookName: `use${capitalize(requestName)}SuspenseQuery`,
        optionsFunctionName: `${requestName}Options`,
        plugin,
        request,
        requestName
      })
    );
  });

  imports.push(
    // import type { requestName1, requestName2 } from './requests.gen';
    getImportRequest({
      folderPath: plugin.config.generateOutput,
      generateOutput: plugin.config.generateOutput,
      requestFilePath: `${plugin.output}/requests`,
      requestName: requestImportNames
    })
  );

  hooksFile.add(...imports);
  hooksFile.add(...hooks);
};
