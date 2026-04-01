import ts from 'typescript';

import type { GetRequestInfoResult } from '../../helpers';

interface GetQueryKeyParams {
  requestInfo: GetRequestInfoResult;
  requestName: string;
}

// queryKey: [requestNameSuspenseQueryKey, ...(!!settings.request.path ? [settings.request.path] : undefined)]
export const getQueryKey = ({ requestInfo, requestName }: GetQueryKeyParams) => {
  const getRequestSettingsAccess = (field: string) =>
    ts.factory.createPropertyAccessChain(
      ts.factory.createPropertyAccessChain(
        ts.factory.createIdentifier('settings'),
        !requestInfo.hasRequiredParam
          ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
          : undefined,
        ts.factory.createIdentifier('request')
      ),
      !requestInfo.hasRequiredParam
        ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
        : undefined,
      ts.factory.createIdentifier(field)
    );

  return ts.factory.createPropertyAssignment(
    ts.factory.createIdentifier('queryKey'),
    ts.factory.createArrayLiteralExpression(
      [
        ts.factory.createIdentifier(`${requestName}QueryKey`),
        ...['path', 'query', 'body'].map((field) =>
          ts.factory.createSpreadElement(
            ts.factory.createParenthesizedExpression(
              ts.factory.createConditionalExpression(
                ts.factory.createPrefixUnaryExpression(
                  ts.SyntaxKind.ExclamationToken,
                  ts.factory.createPrefixUnaryExpression(
                    ts.SyntaxKind.ExclamationToken,
                    getRequestSettingsAccess(field)
                  )
                ),
                undefined,
                ts.factory.createArrayLiteralExpression([getRequestSettingsAccess(field)], false),
                undefined,
                ts.factory.createArrayLiteralExpression([], false)
              )
            )
          )
        )
      ],
      false
    )
  );
};
