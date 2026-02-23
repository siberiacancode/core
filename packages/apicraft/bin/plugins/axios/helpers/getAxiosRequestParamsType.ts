import ts from 'typescript';

interface GetAxiosRequestParamsTypeParams {
  requestDataTypeName: string;
  requestParamsTypeName: string;
}

// type RequestParams = AxiosRequestParams<RequestData>;
export const getAxiosRequestParamsType = ({
  requestDataTypeName,
  requestParamsTypeName
}: GetAxiosRequestParamsTypeParams) =>
  ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(requestParamsTypeName),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('AxiosRequestParams'), [
      ts.factory.createTypeReferenceNode(
        ts.factory.createIdentifier(requestDataTypeName),
        undefined
      )
    ])
  );
