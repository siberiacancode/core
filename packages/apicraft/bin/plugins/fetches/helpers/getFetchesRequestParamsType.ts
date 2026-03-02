import ts from 'typescript';

interface GetFetchesRequestParamsTypeParams {
  requestDataTypeName: string;
  requestParamsTypeName: string;
}

// type RequestParams = FetchesRequestParams<RequestData>;
export const getFetchesRequestParamsType = ({
  requestDataTypeName,
  requestParamsTypeName
}: GetFetchesRequestParamsTypeParams) =>
  ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(requestParamsTypeName),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('FetchesRequestParams'), [
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestDataTypeName),
        undefined
      )
    ])
  );
