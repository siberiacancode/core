import type { IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';

import { capitalize, getApicraftTypeImport, getImportRequest } from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../../types';

import { getReatomAsync, getReatomAsyncData, getReatomImport } from '../../helpers';

interface GenerateReatomFileParams {
  plugin: ReatomPlugin['Instance'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestName: string;
}

export const generateReatomFile = ({
  plugin,
  request,
  requestName,
  requestFilePath
}: GenerateReatomFileParams) => {
  const reatomFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'reatom')}/${requestName}`;
  const reatomFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${reatomFilePath}`);
  const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;

  const reatomFile = plugin.createFile({
    id: requestName,
    path: reatomFilePath
  });

  // import type { ReatomAsyncDataSettings, ReatomAsyncSettings } from '@siberiacancode/apicraft';
  reatomFile.add(getApicraftTypeImport(['ReatomAsyncDataSettings', 'ReatomAsyncSettings']));

  // import { action, computed, wrap, withAsync, withAsyncData } from '@reatom/core';
  reatomFile.add(getReatomImport(['action', 'computed', 'wrap', 'withAsync', 'withAsyncData']));

  // import { requestName } from './requestName.gen';
  reatomFile.add(
    getImportRequest({
      folderPath: reatomFolderPath,
      requestFilePath,
      requestName,
      generateOutput: plugin.config.generateOutput
    })
  );

  // import { RequestNameRequestParams } from './requestName.gen';
  reatomFile.add(
    getImportRequest({
      folderPath: reatomFolderPath,
      requestFilePath,
      requestName: requestParamsTypeName,
      generateOutput: plugin.config.generateOutput
    })
  );

  // export const requestNameAsyncData = (...) => computed(...).extend(withAsyncData(...));
  reatomFile.add(
    getReatomAsyncData({
      plugin,
      request,
      requestName,
      requestParamsTypeName
    })
  );

  // export const requestNameAsync = (...) => action(...).extend(withAsync(...));
  reatomFile.add(
    getReatomAsync({
      plugin,
      requestName,
      requestParamsTypeName
    })
  );
};
