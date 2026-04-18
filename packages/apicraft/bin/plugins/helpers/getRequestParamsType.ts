import ts from 'typescript';

import type { ApicraftInstanceName } from '@/bin/schemas';

import type { GetRequestInfoResult } from './getRequestInfo';

import { capitalize } from './capitalize';

interface GetRequestParamsTypeParams {
  instanceName: ApicraftInstanceName;
  requestDataTypeName: string;
  requestInfo: GetRequestInfoResult;
  requestParamsTypeName: string;
}

// type RequestParams = InstanceNameRequestParams<RequestData>;
export const getRequestParamsType = ({
  instanceName,
  requestInfo,
  requestDataTypeName,
  requestParamsTypeName
}: GetRequestParamsTypeParams) =>
  ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(requestParamsTypeName),
    undefined,
    requestInfo.hasRequiredParam
      ? ts.factory.createTypeReferenceNode(
          ts.factory.createIdentifier(`${capitalize(instanceName)}RequestParams`),
          [
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier(requestDataTypeName),
              undefined
            )
          ]
        )
      : ts.factory.createUnionTypeNode([
          ts.factory.createTypeReferenceNode(
            ts.factory.createIdentifier(`${capitalize(instanceName)}RequestParams`),
            [
              ts.factory.createTypeReferenceNode(
                ts.factory.createIdentifier(requestDataTypeName),
                undefined
              )
            ]
          ),
          ts.factory.createKeywordTypeNode(ts.SyntaxKind.VoidKeyword)
        ])
  );
