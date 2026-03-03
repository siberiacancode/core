import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';

import { buildRequestParamsPath } from '@/bin/plugins/helpers';

interface GetAxiosRequestCallExpressionParams {
  instanceVariant: 'class' | 'function';
  request: IR.OperationObject;
  requestInfo: GetRequestInfoResult;
  requestResponseTypeName: string;
}

// instance.request({ method, url, data, params })
export const getAxiosRequestCallExpression = ({
  request,
  requestInfo,
  requestResponseTypeName,
  instanceVariant
}: GetAxiosRequestCallExpressionParams) =>
  ts.factory.createCallExpression(
    instanceVariant === 'class'
      ? ts.factory.createPropertyAccessExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createThis(),
            ts.factory.createIdentifier('instance')
          ),
          ts.factory.createIdentifier('request')
        )
      : ts.factory.createPropertyAccessExpression(
          ts.factory.createIdentifier('instance'),
          ts.factory.createIdentifier('request')
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
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier('method'),
            ts.factory.createStringLiteral(request.method.toUpperCase())
          ),
          ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier('url'),
            requestInfo.hasPathParam
              ? buildRequestParamsPath(request.path)
              : ts.factory.createStringLiteral(request.path)
          ),
          ...(request.body
            ? [
                ts.factory.createPropertyAssignment(
                  ts.factory.createIdentifier('data'),
                  ts.factory.createIdentifier('body')
                )
              ]
            : []),
          ...(request.parameters?.query
            ? [
                ts.factory.createPropertyAssignment(
                  ts.factory.createIdentifier('params'),
                  ts.factory.createIdentifier('query')
                )
              ]
            : []),
          ts.factory.createSpreadAssignment(ts.factory.createIdentifier('config'))
        ],
        true
      )
    ]
  );
