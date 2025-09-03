import ts from 'typescript';

import type { FetchesPlugin } from './types';

const firstCapitalLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const handler: FetchesPlugin['Handler'] = ({ plugin }) => {
  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const { operation } = event;

    const operationName = operation.operationId ?? 'unnamedOperation';

    const file = plugin.createFile({
      id: operationName,
      path: `${plugin.output}/${operationName}`
    });

    // --- import fetches, { ApiFetchesRequest } from '@siberiacancode/fetches';
    const importFetches = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        ts.factory.createIdentifier('fetches'),
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('ApiFetchesRequest')
          )
        ])
      ),
      ts.factory.createStringLiteral('@siberiacancode/fetches')
    );

    // --- import { FooData, FooResponse } from 'generated/types.gen';
    const importTypes = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(`${firstCapitalLetter(operationName)}Data`)
          ),
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(`${firstCapitalLetter(operationName)}Response`)
          )
        ])
      ),
      ts.factory.createStringLiteral('generated/types.gen')
    );

    // --- export const getUserByName: ApiFetchesRequest<FooData, FooResponse> = ({ params, config }) => ...
    const funcDecl = ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(operationName),
            undefined,
            ts.factory.createTypeReferenceNode('ApiFetchesRequest', [
              ts.factory.createTypeReferenceNode(
                `${firstCapitalLetter(operationName)}Data`,
                undefined
              ),
              ts.factory.createTypeReferenceNode(
                `${firstCapitalLetter(operationName)}Response`,
                undefined
              )
            ]),
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
                      ts.factory.createIdentifier('params'),
                      undefined
                    ),
                    ts.factory.createBindingElement(
                      undefined,
                      undefined,
                      ts.factory.createIdentifier('config'),
                      undefined
                    )
                  ]),
                  undefined,
                  undefined
                )
              ],
              undefined,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier('fetches'),
                  ts.factory.createIdentifier(operation.method.toLowerCase())
                ),
                undefined,
                [
                  ts.factory.createStringLiteral(operation.path),
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createSpreadAssignment(ts.factory.createIdentifier('config')),
                      ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier('params'),
                        ts.factory.createObjectLiteralExpression(
                          [
                            ts.factory.createSpreadAssignment(
                              ts.factory.createPropertyAccessExpression(
                                ts.factory.createIdentifier('config'),
                                ts.factory.createIdentifier('params')
                              )
                            ),
                            ts.factory.createSpreadAssignment(ts.factory.createIdentifier('params'))
                          ],
                          true
                        )
                      )
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

    // Add nodes
    file.add(importFetches);
    file.add(importTypes);
    file.add(funcDecl);
  });
};
