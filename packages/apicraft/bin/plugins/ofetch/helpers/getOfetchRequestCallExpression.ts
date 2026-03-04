import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';

import { buildRequestParamsPath } from '@/bin/plugins/helpers';

interface GetOfetchRequestCallExpressionParams {
  instanceVariant: 'class' | 'function';
  request: IR.OperationObject;
  requestInfo: GetRequestInfoResult;
  requestResponseTypeName: string;
}

// instance(url, { method, body?, query?, ...config })
export const getOfetchRequestCallExpression = ({
  request,
  requestInfo,
  requestResponseTypeName,
  instanceVariant
}: GetOfetchRequestCallExpressionParams) => {
  // ofetch instance is callable: instance(url, options)
  const instance =
    instanceVariant === 'class'
      ? ts.factory.createPropertyAccessExpression(
          ts.factory.createThis(),
          ts.factory.createIdentifier('instance')
        )
      : ts.factory.createIdentifier('instance');

  const url = requestInfo.hasPathParam
    ? buildRequestParamsPath(request.path)
    : ts.factory.createStringLiteral(request.path);

  const options = ts.factory.createObjectLiteralExpression(
    [
      ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier('method'),
        ts.factory.createStringLiteral(request.method.toUpperCase())
      ),
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
  );

  return ts.factory.createCallExpression(
    instance,
    requestInfo.hasResponse
      ? [
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier(requestResponseTypeName),
            undefined
          )
        ]
      : undefined,
    [url, options]
  );
};
