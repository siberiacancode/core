import type ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance,
  getImportRequest
} from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../types';

import { getReatomAsync, getReatomAsyncData, getReatomImport } from '../helpers';

export const classHandler: ReatomPlugin['Handler'] = ({ plugin }) => {
  const reatomFile = plugin.createFile({
    id: 'reatom',
    path: `${plugin.output}/reatom`
  });

  const requestParamsTypeNames: string[] = [];
  const functions: ts.VariableStatement[] = [];

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
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
    // import { RequestNameRequestParams } from './instance.gen';
    getImportRequest({
      folderPath: plugin.output,
      requestFilePath: `${plugin.output}/instance`,
      requestName: requestParamsTypeNames,
      generateOutput: plugin.config.generateOutput
    }),
    // import { instance } from './instance.gen';
    getImportInstance({
      output: plugin.output,
      folderPath: plugin.output,
      generateOutput: plugin.config.generateOutput
    })
  ];

  reatomFile.add(...imports);
  // export const requestNameAsyncData / requestNameAsync
  reatomFile.add(...functions);
};
