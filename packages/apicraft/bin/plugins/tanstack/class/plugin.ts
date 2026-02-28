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
    getTanstackImport(['useQuery', 'useMutation', 'queryOptions', 'useSuspenseQuery']),
    getApicraftTypeImport([
      'TanstackQuerySettings',
      'TanstackMutationSettings',
      'TanstackSuspenseQuerySettings'
    ]),
    getImportInstance({
      output: plugin.output,
      folderPath: plugin.output,
      generateOutput: plugin.config.generateOutput
    })
  ];

  const hooks: ts.VariableStatement[] = [];

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

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

  hooksFile.add(...imports);
  hooksFile.add(...hooks);
};
