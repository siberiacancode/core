import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';
import ts from 'typescript';

import type { TanstackPluginConfig } from '../types';

import { capitalize, checkRequestHasRequiredParam } from '../../helpers';
import { getRequestParamsHookKeys } from './getRequestParamsHookKeys';

interface GenerateQueryHookParams {
  plugin: Parameters<DefinePlugin<TanstackPluginConfig>['Handler']>[0]['plugin'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestName: string;
}

export const generateQueryHookFile = ({
  plugin,
  request,
  requestName,
  requestFilePath
}: GenerateQueryHookParams) => {
  const hookFolderPath = nodePath.dirname(requestFilePath).replace('requests', 'hooks');
  const hookName = `use${capitalize(requestName)}Query`;

  const hookFile = plugin.createFile({
    id: `${hookFolderPath}/${hookName}`,
    path: `${hookFolderPath}/${hookName}`
  });

  // import { useQuery } from '@tanstack/react-query';
  const importUseQuery = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('useQuery'))
      ])
    ),
    ts.factory.createStringLiteral('@tanstack/react-query')
  );

  // import type { TanstackQuerySettings } from '@siberiacancode/apicraft';
  const importTanstackQuerySettings = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('TanstackQuerySettings')
        )
      ])
    ),
    ts.factory.createStringLiteral('@siberiacancode/apicraft')
  );

  // import type { requestName } from './requestName.gen';
  const importRequest = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(requestName))
      ])
    ),
    ts.factory.createStringLiteral(nodePath.relative(hookFolderPath, `${requestFilePath}.gen`))
  );

  const requestParamsHookKeys = getRequestParamsHookKeys(request);
  const requestHasRequiredParam = checkRequestHasRequiredParam(request);

  // const useMethodRequestNameQuery = (settings: TanstackQuerySettings<typeof requestName>) => useQuery
  const hookFunction = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(hookName),
          undefined,
          undefined,
          ts.factory.createArrowFunction(
            undefined,
            undefined,
            [
              ts.factory.createParameterDeclaration(
                undefined,
                undefined,
                ts.factory.createIdentifier('settings'),
                !requestHasRequiredParam
                  ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                  : undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('TanstackQuerySettings'),
                  [ts.factory.createTypeQueryNode(ts.factory.createIdentifier(requestName))]
                )
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createCallExpression(ts.factory.createIdentifier('useQuery'), undefined, [
              ts.factory.createObjectLiteralExpression(
                [
                  // queryKey: ['requestName', settings.request.path.pathPart]
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('queryKey'),
                    ts.factory.createArrayLiteralExpression(
                      [
                        ts.factory.createStringLiteral(requestName),
                        ...requestParamsHookKeys.path.map((requestPathParam) =>
                          ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessChain(
                              ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier('settings'),
                                !requestHasRequiredParam
                                  ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                  : undefined,
                                ts.factory.createIdentifier('request')
                              ),
                              !requestHasRequiredParam
                                ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                : undefined,
                              ts.factory.createIdentifier('path')
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            ts.factory.createIdentifier(requestPathParam)
                          )
                        ),
                        ...requestParamsHookKeys.query.map((requestQueryParam) =>
                          ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessChain(
                              ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier('settings'),
                                !requestHasRequiredParam
                                  ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                  : undefined,
                                ts.factory.createIdentifier('request')
                              ),
                              !requestHasRequiredParam
                                ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                : undefined,
                              ts.factory.createIdentifier('query')
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            ts.factory.createIdentifier(requestQueryParam)
                          )
                        )
                      ],
                      false
                    )
                  ),
                  // queryFn: async () => requestName({ ...settings.request })
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('queryFn'),
                    ts.factory.createArrowFunction(
                      [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                      undefined,
                      [],
                      undefined,
                      ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                      ts.factory.createCallExpression(
                        ts.factory.createIdentifier(requestName),
                        undefined,
                        [
                          ts.factory.createObjectLiteralExpression(
                            [
                              ts.factory.createSpreadAssignment(
                                ts.factory.createPropertyAccessChain(
                                  ts.factory.createIdentifier('settings'),
                                  !requestHasRequiredParam
                                    ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                    : undefined,
                                  ts.factory.createIdentifier('request')
                                )
                              )
                            ],
                            false
                          )
                        ]
                      )
                    )
                  ),
                  // ...settings.params
                  ts.factory.createSpreadAssignment(
                    ts.factory.createPropertyAccessChain(
                      ts.factory.createIdentifier('settings'),
                      !requestHasRequiredParam
                        ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                        : undefined,
                      ts.factory.createIdentifier('params')
                    )
                  )
                ],
                true
              )
            ])
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  hookFile.add(importUseQuery);
  hookFile.add(importTanstackQuerySettings);
  hookFile.add(importRequest);
  hookFile.add(hookFunction);
};
