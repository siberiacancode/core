import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';

interface GetFetchesRequestParameterDeclarationParams {
  request: IR.OperationObject;
  requestInfo: GetRequestInfoResult;
  requestParamsTypeName: string;
}

// ({ path, body, query, config }: RequestParams)
export const getFetchesRequestParameterDeclaration = ({
  request,
  requestInfo,
  requestParamsTypeName
}: GetFetchesRequestParameterDeclarationParams) =>
  ts.factory.createParameterDeclaration(
    undefined,
    undefined,
    ts.factory.createObjectBindingPattern([
      ts.factory.createBindingElement(
        undefined,
        undefined,
        ts.factory.createIdentifier('config'),
        undefined
      ),
      ...(request.body
        ? [
            ts.factory.createBindingElement(
              undefined,
              undefined,
              ts.factory.createIdentifier('body'),
              undefined
            )
          ]
        : []),
      ...(request.parameters?.query
        ? [
            ts.factory.createBindingElement(
              undefined,
              undefined,
              ts.factory.createIdentifier('query'),
              undefined
            )
          ]
        : []),
      ...(requestInfo.hasPathParam
        ? [
            ts.factory.createBindingElement(
              undefined,
              undefined,
              ts.factory.createIdentifier('path'),
              undefined
            )
          ]
        : [])
    ]),
    undefined,
    ts.factory.createTypeReferenceNode(
      ts.factory.createIdentifier(requestParamsTypeName),
      undefined
    ),
    !requestInfo.hasRequiredParam ? ts.factory.createObjectLiteralExpression([], false) : undefined
  );
