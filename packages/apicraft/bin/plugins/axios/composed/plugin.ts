import * as nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getImportInstance,
  getRequestFilePaths,
  getRequestInfo
} from '@/bin/plugins/helpers';

import type { AxiosPlugin } from '../types';

import {
  addInstanceFile,
  getAxiosRequestCallExpression,
  getAxiosRequestParameterDeclaration,
  getAxiosRequestParamsType,
  getImportAxiosRequestParams
} from '../helpers';

export const composedHandler: AxiosPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestInfo = getRequestInfo({ request });
    const requestName = generateRequestName(request, plugin.config.nameBy);

    const requestFilePaths = getRequestFilePaths({
      groupBy: plugin.config.groupBy,
      output: plugin.output,
      requestName,
      request
    });

    requestFilePaths.forEach((requestFilePath) => {
      const requestFile = plugin.createFile({
        id: requestFilePath,
        path: requestFilePath
      });

      const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
      const requestDataTypeName = `${capitalize(request.id)}Data`;
      const requestResponseTypeName = `${capitalize(request.id)}Response`;

      // import type { AxiosRequestParams } from '@siberiacancode/apicraft';
      const importAxiosRequestParams = getImportAxiosRequestParams();
      const requestFolderPath = nodePath.dirname(
        `${plugin.config.generateOutput}/${requestFilePath}`
      );

      // import type { RequestData, RequestResponse } from 'generated/types.gen';
      const importTypes = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          true,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier(requestDataTypeName)
            ),
            ...(requestInfo.hasResponse
              ? [
                  ts.factory.createImportSpecifier(
                    false,
                    undefined,
                    ts.factory.createIdentifier(requestResponseTypeName)
                  )
                ]
              : [])
          ])
        ),
        ts.factory.createStringLiteral(
          nodePath.relative(
            requestFolderPath,
            nodePath.normalize(`${plugin.config.generateOutput}/types.gen`)
          )
        )
      );

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

      // --- export const request = ({ path, body, query, config }) => ...
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
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                // instance.request({ method, url, data, params })
                getAxiosRequestCallExpression({
                  request,
                  requestInfo,
                  requestResponseTypeName,
                  instanceVariant: 'function'
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
  });
};
