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

    const importAxios = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('axios'))
        ])
      ),
      ts.factory.createStringLiteral('axios')
    );

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
      ts.factory.createStringLiteral(`generated/types.gen`)
    );

    const funcDecl = ts.factory.createFunctionDeclaration(
      [
        ts.factory.createModifier(ts.SyntaxKind.ExportKeyword),
        ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)
      ],
      undefined,
      ts.factory.createIdentifier(operationName),
      undefined,
      [
        ts.factory.createParameterDeclaration(
          undefined,
          undefined,
          ts.factory.createIdentifier('data'),
          undefined,
          ts.factory.createTypeReferenceNode(`${firstCapitalLetter(operationName)}Data`, undefined)
        )
      ],
      ts.factory.createTypeReferenceNode('Promise', [
        ts.factory.createTypeReferenceNode(
          `${firstCapitalLetter(operationName)}Response`,
          undefined
        )
      ]),
      ts.factory.createBlock(
        [
          ts.factory.createVariableStatement(
            undefined,
            ts.factory.createVariableDeclarationList(
              [
                ts.factory.createVariableDeclaration(
                  ts.factory.createIdentifier('res'),
                  undefined,
                  undefined,
                  ts.factory.createAwaitExpression(
                    ts.factory.createCallExpression(
                      ts.factory.createPropertyAccessExpression(
                        ts.factory.createIdentifier('axios'),
                        ts.factory.createIdentifier(operation.method.toLowerCase())
                      ),
                      undefined,
                      operation.method.toLowerCase() === 'get'
                        ? [
                            ts.factory.createStringLiteral(operation.path),
                            ts.factory.createObjectLiteralExpression([
                              ts.factory.createPropertyAssignment(
                                ts.factory.createIdentifier('params'),
                                ts.factory.createIdentifier('data')
                              )
                            ])
                          ]
                        : [
                            ts.factory.createStringLiteral(operation.path),
                            ts.factory.createIdentifier('data')
                          ]
                    )
                  )
                )
              ],
              ts.NodeFlags.Const
            )
          ),
          ts.factory.createReturnStatement(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('res'),
              ts.factory.createIdentifier('data')
            )
          )
        ],
        true
      )
    );

    // add nodes
    file.add(importAxios);
    file.add(importTypes);
    file.add(funcDecl);
  });
};
