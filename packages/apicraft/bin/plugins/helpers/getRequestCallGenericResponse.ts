import ts from 'typescript';

import type { GetRequestInfoResult } from './getRequestInfo';

interface GetRequestCallGenericResponseParams {
  requestErrorTypeName: string;
  requestInfo: GetRequestInfoResult;
  requestResponseTypeName: string;
}

export const getRequestCallGenericResponse = ({
  requestInfo,
  requestErrorTypeName,
  requestResponseTypeName
}: GetRequestCallGenericResponseParams) => {
  if (!requestInfo.hasSuccessResponse && !requestInfo.hasErrorResponse) return;

  if (requestInfo.hasSuccessResponse && !requestInfo.hasErrorResponse) {
    return [
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestResponseTypeName),
        undefined
      )
    ];
  }

  if (requestInfo.hasErrorResponse && !requestInfo.hasSuccessResponse) {
    return [
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestErrorTypeName),
        undefined
      )
    ];
  }

  return [
    ts.factory.createUnionTypeNode([
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestResponseTypeName),
        undefined
      ),
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestErrorTypeName),
        undefined
      )
    ])
  ];
};
