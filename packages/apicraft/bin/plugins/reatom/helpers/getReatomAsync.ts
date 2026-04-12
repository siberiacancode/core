import ts from 'typescript';

import type { ReatomPlugin } from '../types';

interface GetReatomAsyncParams {
  plugin: ReatomPlugin['Instance'];
  requestName: string;
  requestParamsTypeName: string;
}

export const getReatomAsync = ({
  plugin,
  requestName,
  requestParamsTypeName
}: GetReatomAsyncParams) => {
  const asyncName = `${requestName}Async`;

  const requestCall =
    plugin.config.groupBy === 'class'
      ? ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier('instance'),
            ts.factory.createIdentifier(requestName)
          ),
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
                ts.factory.createSpreadAssignment(ts.factory.createIdentifier('payload'))
              ],
              false
            )
          ]
        )
      : ts.factory.createCallExpression(ts.factory.createIdentifier(requestName), undefined, [
          ts.factory.createObjectLiteralExpression(
            [
              ts.factory.createSpreadAssignment(
                ts.factory.createPropertyAccessChain(
                  ts.factory.createIdentifier('settings'),
                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                  ts.factory.createIdentifier('request')
                )
              ),
              ts.factory.createSpreadAssignment(ts.factory.createIdentifier('payload'))
            ],
            false
          )
        ]);

  const requestTypeNode =
    plugin.config.groupBy === 'class'
      ? ts.factory.createTypeQueryNode(
          ts.factory.createQualifiedName(
            ts.factory.createIdentifier('instance'),
            ts.factory.createIdentifier(requestName)
          )
        )
      : ts.factory.createTypeQueryNode(ts.factory.createIdentifier(requestName));

  const actionCall = ts.factory.createCallExpression(
    ts.factory.createIdentifier('action'),
    undefined,
    [
      ts.factory.createArrowFunction(
        [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
        undefined,
        [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createIdentifier('payload'),
            undefined,
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier(requestParamsTypeName),
              undefined
            )
          )
        ],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        ts.factory.createAwaitExpression(
          ts.factory.createCallExpression(ts.factory.createIdentifier('wrap'), undefined, [
            requestCall
          ])
        )
      ),
      ts.factory.createStringLiteral(asyncName)
    ]
  );

  const extendCall = ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(actionCall, ts.factory.createIdentifier('extend')),
    undefined,
    [
      ts.factory.createCallExpression(ts.factory.createIdentifier('withAsync'), undefined, [
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
          ts.factory.createIdentifier(asyncName),
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
                  ts.factory.createIdentifier('ReatomAsyncSettings'),
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
