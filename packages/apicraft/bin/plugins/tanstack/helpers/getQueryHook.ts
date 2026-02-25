import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { TanstackPlugin } from '../types';

import { getRequestInfo } from '../../helpers';

interface GetQueryHookParams {
  hookName: string;
  plugin: TanstackPlugin['Instance'];
  request: IR.OperationObject;
  requestName: string;
}

// const useRequestNameQuery = (settings: TanstackQuerySettings<typeof requestName>) => useQuery
export const getQueryHook = ({ hookName, request, plugin, requestName }: GetQueryHookParams) => {
  const requestInfo = getRequestInfo({ request });

  // export const requestNameQueryKey = requestName;
  const queryKey = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(`${requestName}QueryKey`),
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
                !requestInfo.hasRequiredParam
                  ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                  : undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('TanstackQuerySettings'),
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
            ts.factory.createCallExpression(ts.factory.createIdentifier('useQuery'), undefined, [
              ts.factory.createObjectLiteralExpression(
                [
                  // queryKey: ['requestName', settings.request.path.pathPart]
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('queryKey'),
                    ts.factory.createArrayLiteralExpression(
                      [
                        ts.factory.createStringLiteral(`${requestName}QueryKey`),
                        ...['path', 'query', 'body'].map((field) =>
                          ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessChain(
                              ts.factory.createIdentifier('settings'),
                              !requestInfo.hasRequiredParam
                                ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                : undefined,
                              ts.factory.createIdentifier('request')
                            ),
                            !requestInfo.hasRequiredParam
                              ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                              : undefined,
                            ts.factory.createIdentifier(field)
                          )
                        )
                      ],
                      false
                    )
                  ),
                  // queryFn: async () => requestName({ ...settings.request })
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('queryFn'),
                    ts.factory.createArrowFunction(
                      [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                      undefined,
                      [],
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
                                  !requestInfo.hasRequiredParam
                                    ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                    : undefined,
                                  ts.factory.createIdentifier('request')
                                )
                              )
                            ],
                            false
                          )
                        ]
                      )
                    )
                  ),
                  // ...settings.params
                  ts.factory.createSpreadAssignment(
                    ts.factory.createPropertyAccessChain(
                      ts.factory.createIdentifier('settings'),
                      !requestInfo.hasRequiredParam
                        ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                        : undefined,
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

  return [queryKey, hookFunction];
};
