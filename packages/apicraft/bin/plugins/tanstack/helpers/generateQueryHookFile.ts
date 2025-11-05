import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';
import ts from 'typescript';

import type { TanstackPluginConfig } from '../types';

import { capitalize, requestHasRequiredParam } from '../../helpers';
import { getRequestPathParams } from './getRequestPathParams';

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
  const requestFolderPath = nodePath.dirname(requestFilePath);
  const hookName = `use${capitalize(requestName)}Query`;

  const hookFile = plugin.createFile({
    id: `${requestFolderPath}/${hookName}`,
    path: `${requestFolderPath}/${hookName}`
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

  // import type { getUserByUsername } from './getUserByUsername.gen';
  const importRequest = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(requestName))
      ])
    ),
    ts.factory.createStringLiteral(`./${nodePath.basename(requestFilePath)}.gen`)
  );

  const requestPathParams = getRequestPathParams(request);
  const requestHasRequiredParams = requestHasRequiredParam(request);

  // const useGetUserByUsernameQuery = (settings: TanstackQuerySettings<typeof getUserByUsername>) => useQuery
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
                !requestHasRequiredParams
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
                  // queryKey: ['getUserByUsername', settings.request.path.username]
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('queryKey'),
                    ts.factory.createArrayLiteralExpression(
                      [
                        ts.factory.createStringLiteral(requestName),
                        ...requestPathParams.map((requestPathParam) =>
                          ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessChain(
                              ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier('settings'),
                                !requestHasRequiredParams
                                  ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                  : undefined,
                                ts.factory.createIdentifier('request')
                              ),
                              !requestHasRequiredParams
                                ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                : undefined,
                              ts.factory.createIdentifier('path')
                            ),
                            ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                            ts.factory.createIdentifier(requestPathParam)
                          )
                        )
                      ],
                      false
                    )
                  ),
                  // queryFn: async () => getUserByUsername({ ...settings.request })
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
                                  !requestHasRequiredParams
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
                  // ...settings.query
                  ts.factory.createSpreadAssignment(
                    ts.factory.createPropertyAccessChain(
                      ts.factory.createIdentifier('settings'),
                      !requestHasRequiredParams
                        ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                        : undefined,
                      ts.factory.createIdentifier('query')
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
