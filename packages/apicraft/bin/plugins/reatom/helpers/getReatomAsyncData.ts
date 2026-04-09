import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { capitalize, getRequestInfo } from '@/bin/plugins/helpers';

export type RequestRef = 'function' | 'instance';

interface GetReatomAsyncDataParams {
  request: IR.OperationObject;
  requestName: string;
  requestParamsTypeName: string;
  requestRef: RequestRef;
}

function getRequestFieldsForOperation(request: IR.OperationObject): string[] {
  const hasPathParam = !!Object.keys(request.parameters?.path ?? {}).length;
  const hasQueryParam = !!Object.keys(request.parameters?.query ?? {}).length;
  const hasBody = !!request.body;
  const fields: string[] = [];
  if (hasPathParam) fields.push('path');
  if (hasQueryParam) fields.push('query');
  if (hasBody) fields.push('body');
  fields.push('config');
  return fields;
}

export const getReatomAsyncData = ({
  request,
  requestName,
  requestParamsTypeName,
  requestRef
}: GetReatomAsyncDataParams) => {
  const requestInfo = getRequestInfo({ request });
  const requestFields = getRequestFieldsForOperation(request);
  const asyncDataName = `create${capitalize(requestName)}AsyncData`;

  const settingsTypeNode =
    requestRef === 'instance'
      ? ts.factory.createTypeQueryNode(
          ts.factory.createQualifiedName(
            ts.factory.createIdentifier('instance'),
            ts.factory.createIdentifier(requestName)
          )
        )
      : ts.factory.createTypeQueryNode(ts.factory.createIdentifier(requestName));

  const requestCallArg = ts.factory.createObjectLiteralExpression(
    requestFields.map((field) =>
      ts.factory.createShorthandPropertyAssignment(ts.factory.createIdentifier(field))
    ),
    false
  );

  const requestCall =
    requestRef === 'instance'
      ? ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('instance'),
            ts.factory.createIdentifier(requestName)
          ),
          undefined,
          [requestCallArg]
        )
      : ts.factory.createCallExpression(ts.factory.createIdentifier(requestName), undefined, [
          requestCallArg
        ]);

  const requestAccess = requestInfo.hasRequiredParam
    ? ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('settings'),
        ts.factory.createIdentifier('request')
      )
    : ts.factory.createPropertyAccessChain(
        ts.factory.createIdentifier('settings'),
        ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
        ts.factory.createIdentifier('request')
      );

  const requestVariable = ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('request'),
          undefined,
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
          ts.factory.createAsExpression(
            ts.factory.createBinaryExpression(
              requestAccess,
              ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
              ts.factory.createObjectLiteralExpression([], false)
            ),
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  const unwrapReactiveObjectHelper = ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('unwrapReactiveObject'),
          undefined,
          undefined,
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('value'),
                undefined,
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword)
              )
            ],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.AnyKeyword),
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock(
              [
                ts.factory.createIfStatement(
                  ts.factory.createCallExpression(
                    ts.factory.createPropertyAccessExpression(
                      ts.factory.createIdentifier('Array'),
                      ts.factory.createIdentifier('isArray')
                    ),
                    undefined,
                    [ts.factory.createIdentifier('value')]
                  ),
                  ts.factory.createBlock(
                    [
                      ts.factory.createReturnStatement(
                        ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('value'),
                            ts.factory.createIdentifier('map')
                          ),
                          undefined,
                          [
                            ts.factory.createArrowFunction(
                              undefined,
                              undefined,
                              [ts.factory.createParameterDeclaration(undefined, undefined, 'item')],
                              undefined,
                              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                              ts.factory.createCallExpression(
                                ts.factory.createIdentifier('unwrapReactiveObject'),
                                undefined,
                                [ts.factory.createIdentifier('item')]
                              )
                            )
                          ]
                        )
                      )
                    ],
                    true
                  )
                ),
                ts.factory.createIfStatement(
                  ts.factory.createBinaryExpression(
                    ts.factory.createIdentifier('value'),
                    ts.factory.createToken(ts.SyntaxKind.AmpersandAmpersandToken),
                    ts.factory.createBinaryExpression(
                      ts.factory.createTypeOfExpression(ts.factory.createIdentifier('value')),
                      ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                      ts.factory.createStringLiteral('object')
                    )
                  ),
                  ts.factory.createBlock(
                    [
                      ts.factory.createReturnStatement(
                        ts.factory.createCallExpression(
                          ts.factory.createPropertyAccessExpression(
                            ts.factory.createIdentifier('Object'),
                            ts.factory.createIdentifier('fromEntries')
                          ),
                          undefined,
                          [
                            ts.factory.createCallExpression(
                              ts.factory.createPropertyAccessExpression(
                                ts.factory.createCallExpression(
                                  ts.factory.createPropertyAccessExpression(
                                    ts.factory.createIdentifier('Object'),
                                    ts.factory.createIdentifier('entries')
                                  ),
                                  undefined,
                                  [ts.factory.createIdentifier('value')]
                                ),
                                ts.factory.createIdentifier('map')
                              ),
                              undefined,
                              [
                                ts.factory.createArrowFunction(
                                  undefined,
                                  undefined,
                                  [
                                    ts.factory.createParameterDeclaration(
                                      undefined,
                                      undefined,
                                      ts.factory.createArrayBindingPattern([
                                        ts.factory.createBindingElement(undefined, undefined, 'key'),
                                        ts.factory.createBindingElement(
                                          undefined,
                                          undefined,
                                          'entry'
                                        )
                                      ])
                                    )
                                  ],
                                  undefined,
                                  ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                                  ts.factory.createArrayLiteralExpression(
                                    [
                                      ts.factory.createIdentifier('key'),
                                      ts.factory.createConditionalExpression(
                                        ts.factory.createBinaryExpression(
                                          ts.factory.createTypeOfExpression(
                                            ts.factory.createIdentifier('entry')
                                          ),
                                          ts.factory.createToken(
                                            ts.SyntaxKind.EqualsEqualsEqualsToken
                                          ),
                                          ts.factory.createStringLiteral('function')
                                        ),
                                        undefined,
                                        ts.factory.createConditionalExpression(
                                          ts.factory.createPrefixUnaryExpression(
                                            ts.SyntaxKind.ExclamationToken,
                                            ts.factory.createPrefixUnaryExpression(
                                              ts.SyntaxKind.ExclamationToken,
                                              ts.factory.createPropertyAccessChain(
                                                ts.factory.createIdentifier('entry'),
                                                ts.factory.createToken(
                                                  ts.SyntaxKind.QuestionDotToken
                                                ),
                                                ts.factory.createIdentifier('__reatom')
                                              )
                                            )
                                          ),
                                          undefined,
                                          ts.factory.createCallExpression(
                                            ts.factory.createIdentifier('entry'),
                                            undefined,
                                            []
                                          ),
                                          undefined,
                                          ts.factory.createIdentifier('entry')
                                        ),
                                        undefined,
                                        ts.factory.createCallExpression(
                                          ts.factory.createIdentifier('unwrapReactiveObject'),
                                          undefined,
                                          [ts.factory.createIdentifier('entry')]
                                        )
                                      )
                                    ],
                                    false
                                  )
                                )
                              ]
                            )
                          ]
                        )
                      )
                    ],
                    true
                  )
                ),
                ts.factory.createReturnStatement(ts.factory.createIdentifier('value'))
              ],
              true
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  const createRequestFieldStatement = (field: string): ts.Statement => {
    const requestFieldAccess = ts.factory.createPropertyAccessExpression(
      ts.factory.createIdentifier('request'),
      ts.factory.createIdentifier(field)
    );

    const valueExpression =
      field === 'config'
        ? requestFieldAccess
        : ts.factory.createCallExpression(ts.factory.createIdentifier('unwrapReactiveObject'), undefined, [
            requestFieldAccess
          ]);

    return ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(field),
            undefined,
            ts.factory.createIndexedAccessTypeNode(
              ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(requestParamsTypeName)),
              ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(field))
            ),
            ts.factory.createAsExpression(
              valueExpression,
              ts.factory.createIndexedAccessTypeNode(
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(requestParamsTypeName)),
                ts.factory.createLiteralTypeNode(ts.factory.createStringLiteral(field))
              )
            )
          )
        ],
        ts.NodeFlags.Const
      )
    );
  };

  const computedBody: ts.Statement[] = [
    requestVariable,
    unwrapReactiveObjectHelper,
    ...requestFields.map((field) => createRequestFieldStatement(field)),
    ts.factory.createReturnStatement(
      ts.factory.createAwaitExpression(
        ts.factory.createCallExpression(ts.factory.createIdentifier('wrap'), undefined, [
          requestCall
        ])
      )
    )
  ];

  const computedCall = ts.factory.createCallExpression(
    ts.factory.createIdentifier('computed'),
    undefined,
    [
      ts.factory.createArrowFunction(
        [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
        undefined,
        [],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createBlock(computedBody, true)
      )
    ]
  );

  const extendCall = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(computedCall, ts.factory.createIdentifier('extend')),
    undefined,
    [
      ts.factory.createCallExpression(ts.factory.createIdentifier('withAsyncData'), undefined, [
        ts.factory.createBinaryExpression(
          ts.factory.createPropertyAccessChain(
            ts.factory.createIdentifier('settings'),
            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
            ts.factory.createIdentifier('params')
          ),
          ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
          ts.factory.createObjectLiteralExpression([], false)
        )
      ])
    ]
  );

  return ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(asyncDataName),
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
                  ts.factory.createIdentifier('ReatomAsyncDataSettings'),
                  [settingsTypeNode]
                )
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            extendCall
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );
};
