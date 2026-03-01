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

function createUnwrapAtom(field: string): ts.Statement {
  return ts.factory.createVariableStatement(
    undefined,
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(field),
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('request'),
              ts.factory.createIdentifier(field)
            ),
            undefined,
            []
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );
}

export const getReatomAsyncData = ({
  request,
  requestName,
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

  const computedBody: ts.Statement[] = [
    ts.factory.createVariableStatement(
      undefined,
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier('request'),
            undefined,
            undefined,
            ts.factory.createBinaryExpression(
              requestInfo.hasRequiredParam
                ? ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('settings'),
                    ts.factory.createIdentifier('request')
                  )
                : ts.factory.createPropertyAccessChain(
                    ts.factory.createIdentifier('settings'),
                    ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                    ts.factory.createIdentifier('request')
                  ),
              ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
              ts.factory.createObjectLiteralExpression([], false)
            )
          )
        ],
        ts.NodeFlags.Const
      )
    ),
    ...requestFields.map((field) => createUnwrapAtom(field)),
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
