import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';
import ts from 'typescript';

import type { TanstackPluginConfig } from '../types';

import { capitalize } from '../../helpers';
import { getRequestPathParams } from './getRequestPathParams';

interface GenerateMutationHookFileParams {
  plugin: Parameters<DefinePlugin<TanstackPluginConfig>['Handler']>[0]['plugin'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestName: string;
}

export const generateMutationHookFile = ({
  plugin,
  request,
  requestName,
  requestFilePath
}: GenerateMutationHookFileParams) => {
  const hookFolderPath = nodePath.dirname(requestFilePath).replace('requests', 'hooks');
  const hookName = `use${capitalize(requestName)}Query`;

  const hookFile = plugin.createFile({
    id: `${hookFolderPath}/${hookName}`,
    path: `${hookFolderPath}/${hookName}`
  });

  // import { useMutation } from '@tanstack/react-query';
  const importUseMutation = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('useMutation')
        )
      ])
    ),
    ts.factory.createStringLiteral('@tanstack/react-query')
  );

  // import type { TanstackMutationSettings } from '@siberiacancode/apicraft';
  const importTanstackMutationSettings = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('TanstackMutationSettings')
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
    ts.factory.createStringLiteral(nodePath.relative(hookFolderPath, `${requestFilePath}.gen`))
  );

  const requestPathParams = getRequestPathParams(request);

  // const useGetUserByUsernameMutation = (settings: TanstackMutationSettings<typeof getUserByUsername>) => useMutation
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
                ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('TanstackMutationSettings'),
                  [ts.factory.createTypeQueryNode(ts.factory.createIdentifier(requestName))]
                )
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            // mutationKey: ['getUserByUsername', settings?.request?.path?.username],
            ts.factory.createCallExpression(ts.factory.createIdentifier('useMutation'), undefined, [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('mutationKey'),
                    ts.factory.createArrayLiteralExpression(
                      [
                        ts.factory.createStringLiteral(requestName),
                        ...requestPathParams.map((requestPathParam) =>
                          ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessChain(
                              ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier('settings'),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                ts.factory.createIdentifier('request')
                              ),
                              ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
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
                  // mutationFn: async (params) => getUserByUsername({ ...settings?.request, ...params }),
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('mutationFn'),
                    ts.factory.createArrowFunction(
                      [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
                      undefined,
                      [
                        ts.factory.createParameterDeclaration(
                          undefined,
                          undefined,
                          ts.factory.createIdentifier('params')
                        )
                      ],
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
                                  ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                  ts.factory.createIdentifier('request')
                                )
                              ),
                              ts.factory.createSpreadAssignment(
                                ts.factory.createIdentifier('params')
                              )
                            ],
                            false
                          )
                        ]
                      )
                    )
                  ),
                  // ...settings?.mutation
                  ts.factory.createSpreadAssignment(
                    ts.factory.createPropertyAccessChain(
                      ts.factory.createIdentifier('settings'),
                      ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                      ts.factory.createIdentifier('mutation')
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

  hookFile.add(importUseMutation);
  hookFile.add(importTanstackMutationSettings);
  hookFile.add(importRequest);
  hookFile.add(hookFunction);
};
