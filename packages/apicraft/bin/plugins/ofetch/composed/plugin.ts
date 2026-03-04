import nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance,
  getImportTypes,
  getRequestFilePaths,
  getRequestInfo
} from '@/bin/plugins/helpers';

import type { OfetchPlugin } from '../types';

import {
  addInstanceFile,
  getOfetchRequestCallExpression,
  getOfetchRequestParameterDeclaration,
  getOfetchRequestParamsType
} from '../helpers';

export const composedHandler: OfetchPlugin['Handler'] = ({ plugin }) => {
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

      const requestFolderPath = nodePath.dirname(
        `${plugin.config.generateOutput}/${requestFilePath}`
      );

      const importOfetchRequestParams = getApicraftTypeImport('OfetchRequestParams');
      const importTypes = getImportTypes({
        typeNames: [
          requestDataTypeName,
          ...(requestInfo.hasResponse ? [requestResponseTypeName] : [])
        ],
        folderPath: requestFolderPath,
        generateOutput: plugin.config.generateOutput,
        groupBy: plugin.config.groupBy
      });

      const importInstance = getImportInstance({
        folderPath: requestFolderPath,
        output: plugin.output,
        generateOutput: plugin.config.generateOutput,
        runtimeInstancePath: plugin.config.runtimeInstancePath
      });

      const requestParamsType = getOfetchRequestParamsType({
        requestDataTypeName,
        requestParamsTypeName
      });

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
                  getOfetchRequestParameterDeclaration({
                    request,
                    requestInfo,
                    requestParamsTypeName
                  })
                ],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                getOfetchRequestCallExpression({
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

      requestFile.add(importOfetchRequestParams);
      requestFile.add(importTypes);
      requestFile.add(importInstance);
      requestFile.add(requestParamsType);
      requestFile.add(requestFunction);
    });
  });
};
