import ts from 'typescript';

import type { ApicraftInstanceName } from '@/bin/schemas';

import type { GetRequestInfoResult } from './getRequestInfo';

import { capitalize } from './capitalize';

interface GetRequestCallGenericResponseParams {
  instanceName: ApicraftInstanceName;
  requestErrorTypeName: string;
  requestInfo: GetRequestInfoResult;
  requestResponseTypeName: string;
}

export const getRequestReturnType = ({
  instanceName,
  requestInfo,
  requestErrorTypeName,
  requestResponseTypeName
}: GetRequestCallGenericResponseParams) => {
  if (!requestInfo.hasSuccessResponse && !requestInfo.hasErrorResponse) return;

  const responseTypeName = `Apicraft${capitalize(instanceName)}Response`;

  if (requestInfo.hasSuccessResponse && !requestInfo.hasErrorResponse) {
    return ts.factory.createTypeReferenceNode('Promise', [
      ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(responseTypeName), [
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier(requestResponseTypeName),
          undefined
        )
      ])
    ]);
  }

  if (requestInfo.hasErrorResponse && !requestInfo.hasSuccessResponse) {
    return ts.factory.createTypeReferenceNode('Promise', [
      ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(responseTypeName), [
        ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('never'), undefined),
        ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier(requestErrorTypeName),
          undefined
        )
      ])
    ]);
  }

  return ts.factory.createTypeReferenceNode('Promise', [
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(responseTypeName), [
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestResponseTypeName),
        undefined
      ),
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestErrorTypeName),
        undefined
      )
    ])
  ]);
};
