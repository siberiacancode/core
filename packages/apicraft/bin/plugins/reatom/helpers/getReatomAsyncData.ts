import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { getRequestInfo } from '@/bin/plugins/helpers';

import type { ReatomPlugin } from '../types';

interface GetReatomAsyncDataParams {
  plugin: ReatomPlugin['Instance'];
  request: IR.OperationObject;
  requestName: string;
  requestParamsTypeName: string;
}

export const getReatomAsyncData = ({
  plugin,
  request,
  requestName,
  requestParamsTypeName
}: GetReatomAsyncDataParams) => {
  const requestInfo = getRequestInfo(request);
  const asyncDataName = `${requestName}AsyncData`;

  const requestTypeNode =
    plugin.config.groupBy === 'class'
      ? ts.factory.createTypeQueryNode(
          ts.factory.createQualifiedName(
            ts.factory.createIdentifier('instance'),
            ts.factory.createIdentifier(requestName)
          )
        )
      : ts.factory.createTypeQueryNode(ts.factory.createIdentifier(requestName));

  const requestCall =
    plugin.config.groupBy === 'class'
      ? ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('instance'),
            ts.factory.createIdentifier(requestName)
          ),
          undefined,
          [ts.factory.createIdentifier('normalizedRequest')]
        )
      : ts.factory.createCallExpression(ts.factory.createIdentifier(requestName), undefined, [
          ts.factory.createIdentifier('normalizedRequest')
        ]);

  // const unwrap = (value: unknown): unknown => { ... }
  const unwrapHelper = ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('unwrap'),
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
                ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword)
              )
            ],
            ts.factory.createKeywordTypeNode(ts.SyntaxKind.UnknownKeyword),
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createBlock(
              [
                ts.factory.createIfStatement(
                  ts.factory.createBinaryExpression(
                    ts.factory.createTypeOfExpression(ts.factory.createIdentifier('value')),
                    ts.factory.createToken(ts.SyntaxKind.EqualsEqualsEqualsToken),
                    ts.factory.createStringLiteral('function')
                  ),
                  ts.factory.createBlock(
                    [
                      ts.factory.createReturnStatement(
                        ts.factory.createCallExpression(
                          ts.factory.createIdentifier('value'),
                          undefined,
                          []
                        )
                      )
                    ],
                    true
                  )
                ),
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
                                ts.factory.createIdentifier('unwrap'),
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
                                        ts.factory.createBindingElement(
                                          undefined,
                                          undefined,
                                          'key'
                                        ),
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
                                      ts.factory.createCallExpression(
                                        ts.factory.createIdentifier('unwrap'),
                                        undefined,
                                        [ts.factory.createIdentifier('entry')]
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

  // const normalizedRequest = unwrap(settings.request ?? {}) as RequestParams;
  const normalizedRequestVariable = ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('normalizedRequest'),
          undefined,
          ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(requestParamsTypeName)),
          ts.factory.createAsExpression(
            ts.factory.createCallExpression(ts.factory.createIdentifier('unwrap'), undefined, [
              ts.factory.createBinaryExpression(
                requestAccess,
                ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                ts.factory.createObjectLiteralExpression([], false)
              )
            ]),
            ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(requestParamsTypeName))
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  const computedBody: ts.Statement[] = [
    unwrapHelper,
    normalizedRequestVariable,
    // return wrap(requestName(normalizedRequest));
    ts.factory.createReturnStatement(
      ts.factory.createCallExpression(ts.factory.createIdentifier('wrap'), undefined, [requestCall])
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
                  [requestTypeNode]
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
