import type ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportRequest
} from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../types';

import { getReatomAsync, getReatomAsyncData, getReatomImport } from '../helpers';

export const standaloneHandler: ReatomPlugin['Handler'] = ({ plugin }) => {
  const reatomFile = plugin.createFile({
    id: 'reatom',
    path: `${plugin.output}/reatom`
  });

  const requestImportNames: string[] = [];
  const requestParamsTypeNames: string[] = [];
  const functions: ts.VariableStatement[] = [];

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;

    requestImportNames.push(requestName);
    requestParamsTypeNames.push(requestParamsTypeName);
    functions.push(
      getReatomAsyncData({
        plugin,
        request,
        requestName,
        requestParamsTypeName
      }),
      getReatomAsync({
        plugin,
        requestName,
        requestParamsTypeName
      })
    );
  });

  const imports: ts.ImportDeclaration[] = [
    // import type { ReatomAsyncDataSettings, ReatomAsyncSettings } from '@siberiacancode/apicraft';
    getApicraftTypeImport(['ReatomAsyncDataSettings', 'ReatomAsyncSettings']),
    // import { action, computed, wrap, withAsync, withAsyncData } from '@reatom/core';
    getReatomImport(['action', 'computed', 'wrap', 'withAsync', 'withAsyncData']),
    // import { requestName1, requestName2 } from './requests.gen';
    getImportRequest({
      folderPath: plugin.config.generateOutput,
      requestFilePath: `${plugin.output}/requests`,
      requestName: requestImportNames,
      generateOutput: plugin.config.generateOutput
    }),
    // import { RequestNameRequestParams } from './requests.gen';
    getImportRequest({
      folderPath: plugin.config.generateOutput,
      requestFilePath: `${plugin.output}/requests`,
      requestName: requestParamsTypeNames,
      generateOutput: plugin.config.generateOutput
    })
  ];

  reatomFile.add(...imports);
  // export const requestNameAsyncData / requestNameAsync
  reatomFile.add(...functions);
};
