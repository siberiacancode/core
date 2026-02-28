import ts from 'typescript';

import type { TanstackPlugin } from '../types';

interface GetMutationHookParams {
  hookName: string;
  plugin: TanstackPlugin['Instance'];
  requestName: string;
}

// const useRequestNameMutation = (settings: TanstackMutationSettings<typeof requestName>) => useMutation
export const getMutationHook = ({ hookName, plugin, requestName }: GetMutationHookParams) => {
  // export const requestNameMutationKey = requestName;
  const mutationKey = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(`${requestName}MutationKey`),
          undefined,
          undefined,
          ts.factory.createStringLiteral(requestName)
        )
      ],
      ts.NodeFlags.Const
    )
  );

  const hookFunction = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(hookName),
          undefined,
          undefined,
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('settings'),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('TanstackMutationSettings'),
                  [
                    ts.factory.createTypeQueryNode(
                      plugin.config.groupBy === 'class'
                        ? ts.factory.createQualifiedName(
                            ts.factory.createIdentifier('instance'),
                            ts.factory.createIdentifier(requestName)
                          )
                        : ts.factory.createIdentifier(requestName)
                    )
                  ]
                )
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            // mutationKey: [requestNameMutationKey],
            ts.factory.createCallExpression(ts.factory.createIdentifier('useMutation'), undefined, [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('mutationKey'),
                    ts.factory.createArrayLiteralExpression(
                      [ts.factory.createStringLiteral(`${requestName}MutationKey`)],
                      false
                    )
                  ),
                  // mutationFn: async (params) => requestName({ ...settings?.request, ...params }),
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('mutationFn'),
                    ts.factory.createArrowFunction(
                      [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                      undefined,
                      [
                        ts.factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          ts.factory.createIdentifier('params')
                        )
                      ],
                      undefined,
                      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                      ts.factory.createCallExpression(
                        plugin.config.groupBy === 'class'
                          ? ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier('instance'),
                              ts.factory.createIdentifier(requestName)
                            )
                          : ts.factory.createIdentifier(requestName),
                        undefined,
                        [
                          ts.factory.createObjectLiteralExpression(
                            [
                              ts.factory.createSpreadAssignment(
                                ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier('settings'),
                                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                  ts.factory.createIdentifier('request')
                                )
                              ),
                              ts.factory.createSpreadAssignment(
                                ts.factory.createIdentifier('params')
                              )
                            ],
                            false
                          )
                        ]
                      )
                    )
                  ),
                  // ...settings?.params
                  ts.factory.createSpreadAssignment(
                    ts.factory.createPropertyAccessChain(
                      ts.factory.createIdentifier('settings'),
                      ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                      ts.factory.createIdentifier('params')
                    )
                  )
                ],
                true
              )
            ])
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  return [mutationKey, hookFunction];
};
