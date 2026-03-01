import type ts from 'typescript';

import { capitalize, generateRequestName, getImportInstance } from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../types';

import {
  getImportRequestParamsTypes,
  getReatomAsync,
  getReatomAsyncData,
  getReatomCoreImport,
  getReatomSettingsTypeImport
} from '../helpers';

export const classHandler: ReatomPlugin['Handler'] = ({ plugin }) => {
  const reatomFile = plugin.createFile({
    id: 'reatom',
    path: `${plugin.output}/reatom`
  });

  const requestParamsTypeNames: string[] = [];

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    requestParamsTypeNames.push(`${capitalize(requestName)}RequestParams`);
  });

  const imports: ts.ImportDeclaration[] = [
    getReatomCoreImport(),
    getReatomSettingsTypeImport(),
    getImportInstance({
      output: plugin.output,
      folderPath: plugin.output,
      generateOutput: plugin.config.generateOutput
    }),
    getImportRequestParamsTypes({
      folderPath: plugin.output,
      generateOutput: plugin.config.generateOutput,
      output: plugin.output,
      requestParamsTypeNames
    })
  ];

  reatomFile.add(...imports);

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;

    reatomFile.add(
      getReatomAsyncData({
        request,
        requestName,
        requestParamsTypeName,
        requestRef: 'instance'
      })
    );
    reatomFile.add(
      getReatomAsync({
        requestName,
        requestParamsTypeName,
        requestRef: 'instance'
      })
    );
  });
};
