import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';

import { buildRequestParamsPath } from '@/bin/plugins/helpers';

interface GetFetchesRequestCallExpressionParams {
  instanceVariant: 'class' | 'function';
  request: IR.OperationObject;
  requestInfo: GetRequestInfoResult;
  requestResponseTypeName: string;
}

// instance.call(method, url, { body?, query?, ...config })
export const getFetchesRequestCallExpression = ({
  request,
  requestInfo,
  requestResponseTypeName,
  instanceVariant
}: GetFetchesRequestCallExpressionParams) =>
  ts.factory.createCallExpression(
    instanceVariant === 'class'
      ? ts.factory.createPropertyAccessExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            ts.factory.createIdentifier('instance')
          ),
          ts.factory.createIdentifier('call')
        )
      : ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('instance'),
          ts.factory.createIdentifier('call')
        ),
    requestInfo.hasResponse
      ? [
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier(requestResponseTypeName),
            undefined
          )
        ]
      : undefined,
    [
      ts.factory.createStringLiteral(request.method.toUpperCase()),
      requestInfo.hasPathParam
        ? buildRequestParamsPath(request.path)
        : ts.factory.createStringLiteral(request.path),
      ts.factory.createObjectLiteralExpression(
        [
          ...(request.body
            ? [
                ts.factory.createShorthandPropertyAssignment(
                  ts.factory.createIdentifier('body'),
                  undefined
                )
              ]
            : []),
          ...(request.parameters?.query
            ? [
                ts.factory.createShorthandPropertyAssignment(
                  ts.factory.createIdentifier('query'),
                  undefined
                )
              ]
            : []),
          ts.factory.createSpreadAssignment(ts.factory.createIdentifier('config'))
        ],
        true
      )
    ]
  );
