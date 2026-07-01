import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers/';

import { capitalize } from '@/bin/plugins/helpers/';

import type { TanstackPlugin } from '../types';

import { getQueryKey } from './getQueryKey';

interface GetQueryHookParams {
  hookName: string;
  optionsFunctionName: string;
  plugin: TanstackPlugin['Instance'];
  requestErrorTypeName: string;
  requestInfo: GetRequestInfoResult;
  requestName: string;
}

// const requestNameQueryKey = requestName;
// const requestNameQueryOptions = <TData = RequestNameHookData, TError = DefaultError>(settings: {...}) => queryOptions({...})
// const useRequestNameQuery = <TData = RequestNameHookData, TError = DefaultError>(...args: Parameters<typeof requestNameQueryOptions<TData, TError>>) => useQuery(requestNameQueryOptions<TData, TError>(...args))
export const getQueryHook = ({
  hookName,
  optionsFunctionName,
  requestInfo,
  requestErrorTypeName,
  plugin,
  requestName
}: GetQueryHookParams) => {
  const queryKeyName = `${requestName}QueryKey`;
  const hookDataTypeName = `${capitalize(requestName)}HookData`;

  const requestEntityName =
    plugin.config.groupBy === 'class'
      ? ts.factory.createQualifiedName(
          ts.factory.createIdentifier('instance'),
          ts.factory.createIdentifier(requestName)
        )
      : ts.factory.createIdentifier(requestName);

  const requestCallExpression =
    plugin.config.groupBy === 'class'
      ? ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('instance'),
          ts.factory.createIdentifier(requestName)
        )
      : ts.factory.createIdentifier(requestName);

  const tDataTypeRef = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('TData'));
  const tErrorTypeRef = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('TError'));
  const hookDataTypeRef = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier(hookDataTypeName)
  );

  // export const requestNameQueryKey = "requestNameQueryKey";
  const queryKey = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(queryKeyName),
          undefined,
          undefined,
          ts.factory.createStringLiteral(queryKeyName)
        )
      ],
      ts.NodeFlags.Const
    )
  );

  const useQueryOptionsTypeRef = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier('UseQueryOptions'),
    [hookDataTypeRef, tErrorTypeRef, tDataTypeRef]
  );

  // export const requestNameQueryOptions = <TData = RequestNameHookData, TError = DefaultError>(settings: {...}) => queryOptions({...})
  const optionsFunction = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(optionsFunctionName),
          undefined,
          undefined,
          ts.factory.createArrowFunction(
            undefined,
            [
              ts.factory.createTypeParameterDeclaration(
                undefined,
                ts.factory.createIdentifier('TData'),
                undefined,
                hookDataTypeRef
              ),
              ts.factory.createTypeParameterDeclaration(
                undefined,
                ts.factory.createIdentifier('TError'),
                undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier(requestErrorTypeName)
                )
              )
            ],
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('settings'),
                !requestInfo.hasRequiredParam
                  ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                  : undefined,
                ts.factory.createTypeLiteralNode([
                  // params?: Omit<UseQueryOptions<RequestNameHookData, TError, TData>, 'queryKey'>;
                  ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier('params'),
                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Omit'), [
                      useQueryOptionsTypeRef,
                      ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral('queryKey'))
                    ])
                  ),
                  // request: NonNullable<Parameters<typeof requestName>[0]>;
                  ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier('request'),
                    !requestInfo.hasRequiredParam
                      ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                      : undefined,
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('NonNullable'), [
                      ts.factory.createIndexedAccessTypeNode(
                        ts.factory.createTypeReferenceNode(
                          ts.factory.createIdentifier('Parameters'),
                          [ts.factory.createTypeQueryNode(requestEntityName)]
                        ),
                        ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral('0'))
                      )
                    ])
                  )
                ])
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createCallExpression(
              ts.factory.createIdentifier('queryOptions'),
              undefined,
              [
                ts.factory.createObjectLiteralExpression(
                  [
                    // queryKey: [requestNameQueryKey, ...(!!settings.request.path ? [settings.request.path] : [])]
                    getQueryKey({ requestInfo, queryKeyName }),
                    // queryFn: async () => requestName({ ...settings.request })
                    ts.factory.createPropertyAssignment(
                      ts.factory.createIdentifier('queryFn'),
                      ts.factory.createArrowFunction(
                        [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                        undefined,
                        [],
                        undefined,
                        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        ts.factory.createCallExpression(requestCallExpression, undefined, [
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
                        ])
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
              ]
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  // export const useRequestNameQuery = <TData = RequestNameHookData, TError = DefaultError>(...args: Parameters<typeof requestNameQueryOptions<TData, TError>>) => useQuery(requestNameQueryOptions<TData, TError>(...args))
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
            [
              ts.factory.createTypeParameterDeclaration(
                undefined,
                ts.factory.createIdentifier('TData'),
                undefined,
                hookDataTypeRef
              ),
              ts.factory.createTypeParameterDeclaration(
                undefined,
                ts.factory.createIdentifier('TError'),
                undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier(requestErrorTypeName)
                )
              )
            ],
            [
              ts.factory.createParameterDeclaration(
                undefined,
                ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
                ts.factory.createIdentifier('args'),
                undefined,
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Parameters'), [
                  ts.factory.createTypeQueryNode(ts.factory.createIdentifier(optionsFunctionName), [
                    tDataTypeRef,
                    tErrorTypeRef
                  ])
                ])
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createCallExpression(ts.factory.createIdentifier('useQuery'), undefined, [
              ts.factory.createCallExpression(
                ts.factory.createIdentifier(optionsFunctionName),
                [tDataTypeRef, tErrorTypeRef],
                [ts.factory.createSpreadElement(ts.factory.createIdentifier('args'))]
              )
            ])
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  return [queryKey, optionsFunction, hookFunction];
};
