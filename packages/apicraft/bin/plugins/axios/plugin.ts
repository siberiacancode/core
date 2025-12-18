import * as nodePath from 'node:path';
import ts from 'typescript';

import type { AxiosPlugin } from './types';

import { buildRequestParamsPath, capitalize, generateRequestName, normalizePath } from '../helpers';
import { addInstanceFile } from './helpers';

export const handler: AxiosPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

    const requestFilePaths: string[] = [];
    if (plugin.config.groupBy === 'tag') {
      const tags = request.tags ?? ['default'];

      tags.forEach((tag) => {
        requestFilePaths.push(normalizePath(`${plugin.output}/requests/${tag}/${requestName}`));
      });
    }
    if (plugin.config.groupBy === 'path') {
      requestFilePaths.push(
        normalizePath(`${plugin.output}/requests/${request.path}/${request.method.toLowerCase()}`)
      );
    }

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
            normalizePath(`${plugin.config.generateOutput}/types.gen`)
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
              normalizePath(`${plugin.config.generateOutput}/${plugin.output}/instance.gen`)
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

      const requestHasUrlParams = /\{\w+\}/.test(request.path);

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

                      ...(requestHasUrlParams
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
                    undefined
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
                          requestHasUrlParams
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
