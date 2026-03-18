import nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance,
  getImportRuntimeResponseType,
  getImportTypes,
  getRequestFilePath,
  getRequestInfo,
  getRequestReturnType,
  hasRuntimeResponseType
} from '@/bin/plugins/helpers';

import type { OFetchPlugin } from '../types';

import {
  addInstanceFile,
  getOfetchRequestCallExpression,
  getOfetchRequestParameterDeclaration,
  getOfetchRequestParamsType
} from '../helpers';

export const composedHandler: OFetchPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);
  const useRuntimeResponseType =
    !!plugin.config.runtimeInstancePath &&
    hasRuntimeResponseType(plugin.config.runtimeInstancePath);

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

    // import type { OFetchRequestParams, ... } from '@siberiacancode/apicraft';
    const importApicraftTypes = getApicraftTypeImport([
      'OFetchRequestParams',
      ...(!useRuntimeResponseType ? ['ApicraftOfetchResponse'] : [])
    ]);
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

    // type RequestParams = OFetchRequestParams<RequestData>;
    const requestParamsType = getOfetchRequestParamsType({
      requestDataTypeName,
      requestParamsTypeName
    });

    const requestReturnType = getRequestReturnType({
      useRuntimeResponseType,
      instanceName: 'ofetch',
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
                getOfetchRequestParameterDeclaration({
                  request,
                  requestInfo,
                  requestParamsTypeName
                })
              ],
              requestReturnType,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              // instance(url, { method, body?, query?, ...config })
              getOfetchRequestCallExpression({
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

    requestFile.add(importApicraftTypes);
    requestFile.add(importTypes);
    if (useRuntimeResponseType) {
      requestFile.add(
        getImportRuntimeResponseType({
          folderPath: requestFolderPath,
          runtimeInstancePath: plugin.config.runtimeInstancePath!
        })
      );
    }
    requestFile.add(importInstance);
    requestFile.add(requestParamsType);
    requestFile.add(requestFunction);
  });
};
