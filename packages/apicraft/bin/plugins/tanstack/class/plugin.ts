import type ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance
} from '@/bin/plugins/helpers';

import type { TanstackPlugin } from '../types';

import { getMutationHook, getQueryHook, getSuspenseQueryHook, getTanstackImport } from '../helpers';

export const classHandler: TanstackPlugin['Handler'] = ({ plugin }) => {
  const hooksFile = plugin.createFile({
    id: 'hooks',
    path: `${plugin.output}/hooks`
  });

  const imports: ts.ImportDeclaration[] = [
    // import { useQuery, useMutation, queryOptions, useSuspenseQuery } from '@tanstack/react-query';
    getTanstackImport(['useQuery', 'useMutation', 'queryOptions', 'useSuspenseQuery']),
    // import type { TanstackQuerySettings, TanstackMutationSettings, TanstackSuspenseQuerySettings } from '@siberiacancode/apicraft';
    getApicraftTypeImport([
      'TanstackQuerySettings',
      'TanstackMutationSettings',
      'TanstackSuspenseQuerySettings'
    ]),
    // import { instance } from '../../instance.gen';
    getImportInstance({
      output: plugin.output,
      folderPath: plugin.config.generateOutput,
      generateOutput: plugin.config.generateOutput
    })
  ];

  const hooks: ts.VariableStatement[] = [];

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

    hooks.push(
      ...getQueryHook({
        hookName: `use${capitalize(requestName)}Query`,
        optionsFunctionName: `${requestName}QueryOptions`,
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
        optionsFunctionName: `${requestName}SuspenseQueryOptions`,
        plugin,
        request,
        requestName
      })
    );
  });

  hooksFile.add(...imports);
  hooksFile.add(...hooks);
};
