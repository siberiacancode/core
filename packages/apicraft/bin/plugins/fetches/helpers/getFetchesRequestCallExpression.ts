import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';
import type { ApicraftOption } from '@/bin/schemas';

import { buildRequestParamsPath, getRequestCallGenericResponse } from '@/bin/plugins/helpers';

interface GetFetchesRequestCallExpressionParams {
  groupBy: ApicraftOption['groupBy'];
  request: IR.OperationObject;
  requestErrorTypeName: string;
  requestInfo: GetRequestInfoResult;
  requestResponseTypeName: string;
}

// instance.call(method, url, { body?, query?, ...config })
export const getFetchesRequestCallExpression = ({
  request,
  requestInfo,
  requestResponseTypeName,
  requestErrorTypeName,
  groupBy
}: GetFetchesRequestCallExpressionParams) =>
  ts.factory.createCallExpression(
    groupBy === 'class'
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
    getRequestCallGenericResponse({ requestInfo, requestResponseTypeName, requestErrorTypeName }),
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
