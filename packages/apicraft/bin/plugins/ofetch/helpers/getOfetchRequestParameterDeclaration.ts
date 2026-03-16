import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import type { GetRequestInfoResult } from '@/bin/plugins/helpers';

interface GetOfetchRequestParameterDeclarationParams {
  request: IR.OperationObject;
  requestInfo: GetRequestInfoResult;
  requestParamsTypeName: string;
}

// ({ config, body, query, path, headers }: RequestParams)
export const getOfetchRequestParameterDeclaration = ({
  request,
  requestInfo,
  requestParamsTypeName
}: GetOfetchRequestParameterDeclarationParams) =>
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
        : []),
      ...(request.parameters?.header
        ? [
            ts.factory.createBindingElement(
              undefined,
              undefined,
              ts.factory.createIdentifier('headers'),
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
