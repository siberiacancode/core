import type { IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';

import { capitalize, getImportRequest } from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../../types';

import {
  getImportRequestParamsTypeFromRequestFile,
  getReatomAsync,
  getReatomAsyncData,
  getReatomCoreImport,
  getReatomSettingsTypeImport
} from '../../helpers';

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

  const reatomFile = plugin.createFile({
    id: requestName,
    path: reatomFilePath
  });

  const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;

  reatomFile.add(getReatomCoreImport());
  reatomFile.add(getReatomSettingsTypeImport());
  reatomFile.add(
    getImportRequest({
      folderPath: reatomFolderPath,
      requestFilePath,
      requestName,
      generateOutput: plugin.config.generateOutput
    })
  );
  reatomFile.add(
    getImportRequestParamsTypeFromRequestFile({
      folderPath: reatomFolderPath,
      generateOutput: plugin.config.generateOutput,
      requestFilePath,
      requestParamsTypeName
    })
  );
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
};
