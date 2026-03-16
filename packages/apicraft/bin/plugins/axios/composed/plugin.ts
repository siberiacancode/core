import nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance,
  getImportTypes,
  getRequestFilePath,
  getRequestInfo,
  getRequestReturnType
} from '@/bin/plugins/helpers';

import type { AxiosPlugin } from '../types';

import {
  addInstanceFile,
  getAxiosRequestCallExpression,
  getAxiosRequestParameterDeclaration,
  getAxiosRequestParamsType
} from '../helpers';

export const composedHandler: AxiosPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestInfo = getRequestInfo(request);
    const requestName = generateRequestName(request, plugin.config.nameBy);

    const requestFilePath = getRequestFilePath({
      groupBy: plugin.config.groupBy,
      output: plugin.output,
      requestName,
      request
    });

    const requestFile = plugin.createFile({
      id: requestFilePath,
      path: requestFilePath
    });

    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
    const requestDataTypeName = `${capitalize(request.id)}Data`;
    const requestResponseTypeName = `${capitalize(request.id)}Response`;
    const requestErrorTypeName = `${capitalize(request.id)}Error`;

    const requestFolderPath = nodePath.dirname(
      `${plugin.config.generateOutput}/${requestFilePath}`
    );

    // import type { AxiosRequestParams } from '@siberiacancode/apicraft';
    const importAxiosRequestParams = getApicraftTypeImport('AxiosRequestParams');
    // import type { RequestData, RequestResponse } from 'generated/types.gen';
    const importTypes = getImportTypes({
      typeNames: [
        requestDataTypeName,
        ...(requestInfo.hasSuccessResponse ? [requestResponseTypeName] : []),
        ...(requestInfo.hasErrorResponse ? [requestErrorTypeName] : [])
      ],
      folderPath: requestFolderPath,
      generateOutput: plugin.config.generateOutput
    });

    // import { instance } from "../../instance.gen";
    const importInstance = getImportInstance({
      folderPath: requestFolderPath,
      output: plugin.output,
      generateOutput: plugin.config.generateOutput,
      runtimeInstancePath: plugin.config.runtimeInstancePath
    });

    // type RequestParams = AxiosRequestParams<RequestData>;
    const requestParamsType = getAxiosRequestParamsType({
      requestDataTypeName,
      requestParamsTypeName
    });

    // Promise<ApicraftAxiosResponse<Response, Error>>
    const requestReturnType = getRequestReturnType({
      instanceName: 'axios',
      requestInfo,
      requestResponseTypeName,
      requestErrorTypeName
    });

    // export const request = ({ path, body, query, config }) => ...
    const requestFunction = ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(requestName),
            undefined,
            undefined,
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [
                // ({ path, body, query, config }: RequestParams)
                getAxiosRequestParameterDeclaration({
                  request,
                  requestInfo,
                  requestParamsTypeName
                })
              ],
              requestReturnType,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              // instance.request({ method, url, data, params })
              getAxiosRequestCallExpression({
                request,
                requestInfo,
                groupBy: plugin.config.groupBy
              })
            )
          )
        ],
        ts.NodeFlags.Const
      )
    );

    requestFile.add(importAxiosRequestParams);
    requestFile.add(importTypes);
    requestFile.add(importInstance);
    requestFile.add(requestParamsType);
    requestFile.add(requestFunction);
  });
};
