import ts from 'typescript';

import type { FetchesPlugin } from './types';

import {
  buildRequestParamsPath,
  capitalize,
  generatePathRequestName,
  lowercase,
  normalizePath
} from '../helpers';
import { addInstanceFile } from './helpers';

export const handler: FetchesPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName =
      plugin.config.nameBy === 'operationId' && request.operationId
        ? lowercase(request.operationId)
        : generatePathRequestName(request.method, request.path);

    const requestTag = request.tags?.[0];
    // todo check if tag is in english
    const requestFilePath =
      plugin.config.groupBy === 'tag' && requestTag
        ? normalizePath(`${plugin.output}/requests/${lowercase(requestTag)}/${requestName}`)
        : normalizePath(
            `${plugin.output}/requests/${request.path}/${request.method.toLowerCase()}`
          );

    const requestFile = plugin.createFile({
      id: requestName,
      path: requestFilePath
    });

    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
    const requestDataTypeName = `${capitalize(request.id)}Data`;
    const requestResponseTypeName = `${capitalize(request.id)}Response`;

    // import type { FetchesRequestParams } from '@siberiacancode/apicraft';
    const importFetchesRequestParams = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        true,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('FetchesRequestParams')
          )
        ])
      ),
      ts.factory.createStringLiteral('@siberiacancode/apicraft')
    );

    const requestHasResponse = Object.values(request.responses ?? {}).some(
      (response) => response?.schema.$ref || response?.schema.type !== 'unknown'
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
      ts.factory.createStringLiteral(normalizePath(`${plugin.config.generateOutput}/types.gen`))
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
        plugin.config.runtimeInstancePath ??
          normalizePath(`${plugin.config.generateOutput}/${plugin.output}/instance.gen`)
      )
    );

    // type RequestParams = FetchesRequestParams<RequestData>;
    const requestParamsType = ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(requestParamsTypeName),
      undefined,
      ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('FetchesRequestParams'), [
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
                  ts.factory.createIdentifier('call')
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
                  ts.factory.createStringLiteral(request.method.toUpperCase()),
                  requestHasUrlParams
                    ? buildRequestParamsPath(request.path)
                    : ts.factory.createStringLiteral(request.path),
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createSpreadAssignment(ts.factory.createIdentifier('config')),
                      ...(request.body
                        ? [
                            ts.factory.createShorthandPropertyAssignment(
                              ts.factory.createIdentifier('body'),
                              undefined
                            )
                          ]
                        : []),
                      ...(request.parameters?.query
                        ? [
                            ts.factory.createShorthandPropertyAssignment(
                              ts.factory.createIdentifier('query'),
                              undefined
                            )
                          ]
                        : [])
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

    requestFile.add(importFetchesRequestParams);
    requestFile.add(importTypes);
    requestFile.add(importInstance);
    requestFile.add(requestParamsType);
    requestFile.add(requestFunction);
  });
};
