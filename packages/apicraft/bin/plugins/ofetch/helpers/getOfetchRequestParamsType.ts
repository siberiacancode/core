import ts from 'typescript';

interface GetOfetchRequestParamsTypeParams {
  requestDataTypeName: string;
  requestParamsTypeName: string;
}

// type RequestParams = OFetchRequestParams<RequestData>;
export const getOfetchRequestParamsType = ({
  requestDataTypeName,
  requestParamsTypeName
}: GetOfetchRequestParamsTypeParams) =>
  ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(requestParamsTypeName),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('OFetchRequestParams'), [
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestDataTypeName),
        undefined
      )
    ])
  );
