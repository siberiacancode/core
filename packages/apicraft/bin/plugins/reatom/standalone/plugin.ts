import type ts from 'typescript';

import { capitalize, generateRequestName, getImportRequest } from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../types';

import {
  getImportRequestParamsTypesFromRequestFile,
  getReatomAsync,
  getReatomAsyncData,
  getReatomCoreImport,
  getReatomSettingsTypeImport
} from '../helpers';

export const standaloneHandler: ReatomPlugin['Handler'] = ({ plugin }) => {
  const reatomFile = plugin.createFile({
    id: 'reatom',
    path: `${plugin.output}/reatom`
  });

  const requestImportNames: string[] = [];
  const requestParamsTypeNames: string[] = [];

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;

    requestImportNames.push(requestName);
    requestParamsTypeNames.push(requestParamsTypeName);
  });

  const imports: ts.ImportDeclaration[] = [
    getReatomCoreImport(),
    getReatomSettingsTypeImport(),
    getImportRequest({
      folderPath: plugin.config.generateOutput,
      requestFilePath: `${plugin.output}/requests`,
      requestName: requestImportNames,
      generateOutput: plugin.config.generateOutput
    }),
    getImportRequestParamsTypesFromRequestFile({
      folderPath: plugin.config.generateOutput,
      generateOutput: plugin.config.generateOutput,
      requestFilePath: `${plugin.output}/requests`,
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
        requestRef: 'function'
      })
    );

    reatomFile.add(
      getReatomAsync({
        requestName,
        requestParamsTypeName,
        requestRef: 'function'
      })
    );
  });
};
