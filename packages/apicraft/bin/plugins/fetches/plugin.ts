import ts from 'typescript';

import type { FetchesPlugin } from './types';

import { firstCapitalLetter, getRequestName } from '../helpers';
import { addInstanceFile, getRequestUrl } from './helpers';

export const handler: FetchesPlugin['Handler'] = ({ plugin }) => {
  if (!plugin.config.runtimeInstancePath) addInstanceFile(plugin);

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = getRequestName(request.path, request.method);
    const requestFile = plugin.createFile({
      id: requestName,
      path: `${plugin.output}${request.path}/${request.method.toLowerCase()}`
    });

    const requestParamsTypeName = `${firstCapitalLetter(requestName)}RequestParams`;
    const requestDataTypeName = `${firstCapitalLetter(request.id)}Data`;
    const requestResponseTypeName = `${firstCapitalLetter(request.id)}Response`;

    // import type { RequestConfig } from '@siberiacancode/fetches';
    const importFetches = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        true,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('RequestConfig')
          )
        ])
      ),
      ts.factory.createStringLiteral('@siberiacancode/fetches')
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
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(requestResponseTypeName)
          )
        ])
      ),
      // TODO resolve paths correctly
      ts.factory.createStringLiteral(`${plugin.config.generateOutput}/types.gen`)
    );

    // import { instance } from "./instance.gen";
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
          `${plugin.config.generateOutput}/${plugin.output}/instance.gen`
      )
    );

    // type RequestParams = RequestData & { config: RequestConfig };
    const requestParamsType = ts.factory.createTypeAliasDeclaration(
      undefined,
      ts.factory.createIdentifier(requestParamsTypeName),
      undefined,
      ts.factory.createIntersectionTypeNode([
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier(requestDataTypeName),
          undefined
        ),
        ts.factory.createTypeLiteralNode([
          ts.factory.createPropertySignature(
            undefined,
            ts.factory.createIdentifier('config'),
            undefined,
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier('RequestConfig'),
              undefined
            )
          )
        ])
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
                      ts.factory.createIdentifier('body'),
                      undefined
                    ),
                    ts.factory.createBindingElement(
                      undefined,
                      undefined,
                      ts.factory.createIdentifier('query'),
                      undefined
                    ),
                    ts.factory.createBindingElement(
                      undefined,
                      undefined,
                      ts.factory.createIdentifier('config'),
                      undefined
                    ),
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
                [
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier(requestResponseTypeName),
                    undefined
                  )
                ],
                [
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier('method'),
                        ts.factory.createStringLiteral(request.method.toUpperCase())
                      ),
                      ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier('url'),
                        getRequestUrl(request.path, requestHasUrlParams)
                      ),
                      ts.factory.createShorthandPropertyAssignment(
                        ts.factory.createIdentifier('body'),
                        undefined
                      ),
                      ts.factory.createShorthandPropertyAssignment(
                        ts.factory.createIdentifier('query'),
                        undefined
                      ),
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

    requestFile.add(importFetches);
    requestFile.add(importTypes);
    requestFile.add(importInstance);
    requestFile.add(requestParamsType);
    requestFile.add(requestFunction);
  });
};
