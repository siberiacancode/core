import * as nodePath from 'node:path';
import process from 'node:process';
import ts from 'typescript';

import type { AxiosPlugin } from './types';

import {
  buildRequestParamsPath,
  capitalize,
  checkRequestHasRequiredParam,
  generateRequestName,
  getRequestFilePaths
} from '../helpers';
import { addInstanceFile } from './helpers';

export const handler: AxiosPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
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
      const importAxiosRequestParams = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          true,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('AxiosRequestParams')
            )
          ])
        ),
        ts.factory.createStringLiteral('@siberiacancode/apicraft')
      );

      const requestHasResponse = Object.values(request.responses ?? {}).some(
        (response) => response?.schema.$ref || response?.schema.type !== 'unknown'
      );
      const requestFolderPath = nodePath.dirname(
        `${process.cwd()}/${plugin.config.generateOutput}/${requestFilePath}`
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
            ...(requestHasResponse
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
            nodePath.normalize(`${process.cwd()}/${plugin.config.generateOutput}/types.gen`)
          )
        )
      );

      // import { instance } from "generated/instance.gen";
      const importInstance = ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier('instance')
            )
          ])
        ),
        ts.factory.createStringLiteral(
          nodePath.relative(
            requestFolderPath,
            plugin.config.runtimeInstancePath ??
              nodePath.normalize(
                `${process.cwd()}/${plugin.config.generateOutput}/${plugin.output}/instance.gen`
              )
          )
        )
      );

      // type RequestParams = AxiosRequestParams<RequestData>;
      const requestParamsType = ts.factory.createTypeAliasDeclaration(
        [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
        ts.factory.createIdentifier(requestParamsTypeName),
        undefined,
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('AxiosRequestParams'), [
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier(requestDataTypeName),
            undefined
          )
        ])
      );

      const requestHasPathParam = !!Object.keys(request.parameters?.path ?? {}).length;
      const requestHasRequiredParam = checkRequestHasRequiredParam(request);

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
                  ts.factory.createParameterDeclaration(
                    undefined,
                    undefined,
                    ts.factory.createObjectBindingPattern([
                      ts.factory.createBindingElement(
                        undefined,
                        undefined,
                        ts.factory.createIdentifier('config'),
                        undefined
                      ),
                      ...(request.body
                        ? [
                            ts.factory.createBindingElement(
                              undefined,
                              undefined,
                              ts.factory.createIdentifier('body'),
                              undefined
                            )
                          ]
                        : []),
                      ...(request.parameters?.query
                        ? [
                            ts.factory.createBindingElement(
                              undefined,
                              undefined,
                              ts.factory.createIdentifier('query'),
                              undefined
                            )
                          ]
                        : []),

                      ...(requestHasPathParam
                        ? [
                            ts.factory.createBindingElement(
                              undefined,
                              undefined,
                              ts.factory.createIdentifier('path'),
                              undefined
                            )
                          ]
                        : [])
                    ]),
                    undefined,
                    ts.factory.createTypeReferenceNode(
                      ts.factory.createIdentifier(requestParamsTypeName),
                      undefined
                    ),
                    !requestHasRequiredParam
                      ? ts.factory.createObjectLiteralExpression([], false)
                      : undefined
                  )
                ],
                undefined,
                ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                ts.factory.createCallExpression(
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('instance'),
                    ts.factory.createIdentifier('request')
                  ),
                  requestHasResponse
                    ? [
                        ts.factory.createTypeReferenceNode(
                          ts.factory.createIdentifier(requestResponseTypeName),
                          undefined
                        )
                      ]
                    : undefined,
                  [
                    ts.factory.createObjectLiteralExpression(
                      [
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier('method'),
                          ts.factory.createStringLiteral(request.method.toUpperCase())
                        ),
                        ts.factory.createPropertyAssignment(
                          ts.factory.createIdentifier('url'),
                          requestHasPathParam
                            ? buildRequestParamsPath(request.path)
                            : ts.factory.createStringLiteral(request.path)
                        ),
                        ...(request.body
                          ? [
                              ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier('data'),
                                ts.factory.createIdentifier('body')
                              )
                            ]
                          : []),
                        ...(request.parameters?.query
                          ? [
                              ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier('params'),
                                ts.factory.createIdentifier('query')
                              )
                            ]
                          : []),
                        ts.factory.createSpreadAssignment(ts.factory.createIdentifier('config'))
                      ],
                      true
                    )
                  ]
                )
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
