import ts from 'typescript';

import { capitalize } from '@/bin/plugins/helpers/';

import type { TanstackPlugin } from '../types';

interface GetMutationHookParams {
  hookName: string;
  plugin: TanstackPlugin['Instance'];
  requestErrorTypeName: string;
  requestName: string;
}

// export const requestNameMutationKey = "requestNameMutationKey";
// type RequestNameMutationVariables = Parameters<typeof requestName>[0];
// export const useRequestNameMutation = <TError = DefaultError, TContext = unknown>(settings?: {...}): UseMutationResult<...> => useMutation({...})
export const getMutationHook = ({
  hookName,
  plugin,
  requestErrorTypeName,
  requestName
}: GetMutationHookParams) => {
  const mutationKeyName = `${requestName}MutationKey`;
  const hookDataTypeName = `${capitalize(requestName)}HookData`;
  const variablesTypeName = `${capitalize(requestName)}MutationVariables`;

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

  const tErrorTypeRef = ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('TError'));
  const tContextTypeRef = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier('TContext')
  );
  const hookDataTypeRef = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier(hookDataTypeName)
  );
  const variablesTypeRef = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier(variablesTypeName)
  );

  // export const requestNameMutationKey = "requestNameMutationKey";
  const mutationKey = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(mutationKeyName),
          undefined,
          undefined,
          ts.factory.createStringLiteral(mutationKeyName)
        )
      ],
      ts.NodeFlags.Const
    )
  );

  // type RequestNameMutationVariables = Parameters<typeof requestName>[0];
  const variablesType = ts.factory.createTypeAliasDeclaration(
    undefined,
    ts.factory.createIdentifier(variablesTypeName),
    undefined,
    ts.factory.createIndexedAccessTypeNode(
      ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Parameters'), [
        ts.factory.createTypeQueryNode(requestEntityName)
      ]),
      ts.factory.createLiteralTypeNode(ts.factory.createNumericLiteral('0'))
    )
  );

  const useMutationOptionsTypeRef = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier('UseMutationOptions'),
    [hookDataTypeRef, tErrorTypeRef, variablesTypeRef, tContextTypeRef]
  );

  const useMutationResultTypeRef = ts.factory.createTypeReferenceNode(
    ts.factory.createIdentifier('UseMutationResult'),
    [hookDataTypeRef, tErrorTypeRef, variablesTypeRef, tContextTypeRef]
  );

  // export const useRequestNameMutation = <TError = DefaultError, TContext = unknown>(settings?: {...}): UseMutationResult<...> => useMutation({...})
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
                ts.factory.createIdentifier('TError'),
                undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier(requestErrorTypeName)
                )
              ),
              ts.factory.createTypeParameterDeclaration(
                undefined,
                ts.factory.createIdentifier('TContext'),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
              )
            ],
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('settings'),
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createTypeLiteralNode([
                  // params?: UseMutationOptions<RequestNameMutationHookData, TError, RequestNameMutationVariables, TContext>;
                  ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier('params'),
                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                    useMutationOptionsTypeRef
                  ),
                  // request?: NonNullable<RequestNameMutationVariables>;
                  ts.factory.createPropertySignature(
                    undefined,
                    ts.factory.createIdentifier('request'),
                    ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('NonNullable'), [
                      variablesTypeRef
                    ])
                  )
                ])
              )
            ],
            useMutationResultTypeRef,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createCallExpression(ts.factory.createIdentifier('useMutation'), undefined, [
              ts.factory.createObjectLiteralExpression(
                [
                  // mutationKey: [requestNameMutationKey],
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('mutationKey'),
                    ts.factory.createArrayLiteralExpression(
                      [ts.factory.createIdentifier(mutationKeyName)],
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
                      ts.factory.createCallExpression(requestCallExpression, undefined, [
                        ts.factory.createObjectLiteralExpression(
                          [
                            ts.factory.createSpreadAssignment(
                              ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier('settings'),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                ts.factory.createIdentifier('request')
                              )
                            ),
                            ts.factory.createSpreadAssignment(ts.factory.createIdentifier('params'))
                          ],
                          false
                        )
                      ])
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

  return [mutationKey, variablesType, hookFunction];
};
