import nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportInstance,
  getImportTypes,
  getRequestInfo
} from '@/bin/plugins/helpers';

import type { AxiosPlugin } from '../types';

import {
  addInstanceFile,
  getAxiosRequestCallExpression,
  getAxiosRequestParameterDeclaration,
  getAxiosRequestParamsType
} from '../helpers';

const SINGLE_FILE_ID = 'axiosRequestsSingle';

export const standaloneHandler: AxiosPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  const requestFilePath = nodePath.normalize(`${plugin.output}/requests`);
  const requestFile = plugin.createFile({
    id: SINGLE_FILE_ID,
    path: requestFilePath
  });
  const requestFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${requestFilePath}`);

  const typeImportNames = new Set<string>();
  const typeStatements: ts.Statement[] = [];
  const requestStatements: ts.Statement[] = [];

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestInfo = getRequestInfo(request);
    const requestName = generateRequestName(request, plugin.config.nameBy);

    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
    const requestDataTypeName = `${capitalize(request.id)}Data`;
    const requestResponseTypeName = `${capitalize(request.id)}Response`;
    const requestErrorTypeName = `${capitalize(request.id)}Error`;

    typeImportNames.add(requestDataTypeName);
    if (requestInfo.hasSuccessResponse) typeImportNames.add(requestResponseTypeName);
    if (requestInfo.hasErrorResponse) typeImportNames.add(requestErrorTypeName);

    typeStatements.push(
      getAxiosRequestParamsType({
        requestDataTypeName,
        requestParamsTypeName
      })
    );

    requestStatements.push(
      ts.factory.createVariableStatement(
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
                  getAxiosRequestParameterDeclaration({
                    request,
                    requestInfo,
                    requestParamsTypeName
                  })
                ],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                getAxiosRequestCallExpression({
                  request,
                  requestInfo,
                  requestResponseTypeName,
                  requestErrorTypeName,
                  groupBy: plugin.config.groupBy
                })
              )
            )
          ],
          ts.NodeFlags.Const
        )
      )
    );
  });

  const importAxiosRequestParams = getApicraftTypeImport('AxiosRequestParams');
  const importTypes = getImportTypes({
    typeNames: Array.from(typeImportNames).sort(),
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

  requestFile.add(importAxiosRequestParams);
  requestFile.add(importTypes);
  requestFile.add(importInstance);
  typeStatements.forEach((statement) => requestFile.add(statement));
  requestStatements.forEach((statement) => requestFile.add(statement));
};
