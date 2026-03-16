import nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance,
  getImportTypes,
  getRequestInfo,
  getRequestReturnType
} from '@/bin/plugins/helpers';

import type { FetchesPlugin } from '../types';

import {
  addInstanceFile,
  getFetchesRequestCallExpression,
  getFetchesRequestParameterDeclaration,
  getFetchesRequestParamsType
} from '../helpers';

export const standaloneHandler: FetchesPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  const requestsFilePath = nodePath.normalize(`${plugin.output}/requests`);
  const requestsFolderPath = nodePath.dirname(
    `${plugin.config.generateOutput}/${requestsFilePath}`
  );
  const requestsFile = plugin.createFile({
    id: 'requests',
    path: requestsFilePath
  });

  const typeImportNames = new Set<string>();
  const typeStatements: ts.Statement[] = [];
  const requestStatements: ts.Statement[] = [];

  plugin.forEach('operation', (event) => {
    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestInfo = getRequestInfo(request);

    const requestDataTypeName = `${capitalize(request.id)}Data`;
    typeImportNames.add(requestDataTypeName);

    const requestResponseTypeName = `${capitalize(request.id)}Response`;
    if (requestInfo.hasSuccessResponse) typeImportNames.add(requestResponseTypeName);
    const requestErrorTypeName = `${capitalize(request.id)}Error`;
    if (requestInfo.hasErrorResponse) typeImportNames.add(requestErrorTypeName);

    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
    typeStatements.push(
      getFetchesRequestParamsType({
        requestDataTypeName,
        requestParamsTypeName
      })
    );
    const requestReturnType = getRequestReturnType({
      instanceName: 'fetches',
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
                getFetchesRequestParameterDeclaration({
                  request,
                  requestInfo,
                  requestParamsTypeName
                })
              ],
              requestReturnType,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              // instance.call(method, url, { body?, query?, ...config })
              getFetchesRequestCallExpression({
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

    requestStatements.push(requestFunction);
  });

  // import type { FetchesRequestParams } from '@siberiacancode/apicraft';
  const importFetchesRequestParams = getApicraftTypeImport('FetchesRequestParams');

  // import type { RequestData, RequestResponse, ... } from './types.gen';
  const importTypes = getImportTypes({
    typeNames: Array.from(typeImportNames),
    folderPath: requestsFolderPath,
    generateOutput: plugin.config.generateOutput
  });

  // import { instance } from "../../instance.gen";
  const importInstance = getImportInstance({
    folderPath: requestsFolderPath,
    output: plugin.output,
    generateOutput: plugin.config.generateOutput,
    runtimeInstancePath: plugin.config.runtimeInstancePath
  });

  requestsFile.add(importFetchesRequestParams);
  requestsFile.add(importTypes);
  requestsFile.add(importInstance);
  typeStatements.forEach((statement) => requestsFile.add(statement));
  requestStatements.forEach((statement) => requestsFile.add(statement));
};
