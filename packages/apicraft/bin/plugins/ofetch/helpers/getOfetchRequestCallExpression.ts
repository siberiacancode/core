import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';
import type { ApicraftOption } from '@/bin/schemas';

import { buildRequestParamsPath } from '@/bin/plugins/helpers';

interface GetOfetchRequestCallExpressionParams {
  groupBy: ApicraftOption['groupBy'];
  request: IR.OperationObject;
  requestInfo: GetRequestInfoResult;
}

// instance(url, { method, body?, query?, headers?, ...config })
export const getOfetchRequestCallExpression = ({
  request,
  requestInfo,
  groupBy
}: GetOfetchRequestCallExpressionParams) =>
  ts.factory.createCallExpression(
    groupBy === 'class'
      ? ts.factory.createPropertyAccessExpression(
          ts.factory.createThis(),
          ts.factory.createIdentifier('instance')
        )
      : ts.factory.createIdentifier('instance'),
    undefined,
    [
      requestInfo.hasPathParam
        ? buildRequestParamsPath(request.path)
        : ts.factory.createStringLiteral(request.path),
      ts.factory.createObjectLiteralExpression(
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
          ...(request.parameters?.header
            ? [
                ts.factory.createShorthandPropertyAssignment(
                  ts.factory.createIdentifier('headers'),
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
