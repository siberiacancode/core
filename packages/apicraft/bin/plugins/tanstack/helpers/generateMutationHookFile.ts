import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';
import ts from 'typescript';

import { capitalize, getImportInstance, getImportRequest } from '@/bin/plugins/helpers';

import type { TanstackPluginConfig } from '../types';

import { getRequestParamsHookKeys } from './getRequestParamsHookKeys';

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
  const hookName = `use${capitalize(requestName)}Mutation`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
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

  const requestParamsHookKeys = getRequestParamsHookKeys(request);

  // const useRequestNameMutation = (settings: TanstackMutationSettings<typeof requestName>) => useMutation
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
                  [
                    ts.factory.createTypeQueryNode(
                      plugin.config.groupBy === 'class'
                        ? ts.factory.createQualifiedName(
                            ts.factory.createIdentifier('instance'),
                            ts.factory.createIdentifier(requestName)
                          )
                        : ts.factory.createIdentifier(requestName)
                    )
                  ]
                )
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            // mutationKey: ['requestName', settings?.request?.path?.pathPart, settings?.request?.query?.someQuery],
            ts.factory.createCallExpression(ts.factory.createIdentifier('useMutation'), undefined, [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    ts.factory.createIdentifier('mutationKey'),
                    ts.factory.createArrayLiteralExpression(
                      [
                        ts.factory.createStringLiteral(requestName),
                        ...requestParamsHookKeys.path.map((requestPathParam) =>
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
                        ),
                        ...requestParamsHookKeys.query.map((requestQueryParam) =>
                          ts.factory.createPropertyAccessChain(
                            ts.factory.createPropertyAccessChain(
                              ts.factory.createPropertyAccessChain(
                                ts.factory.createIdentifier('settings'),
                                ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
                                ts.factory.createIdentifier('request')
                              ),
                              ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
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
                  // mutationFn: async (params) => requestName({ ...settings?.request, ...params }),
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
                        plugin.config.groupBy === 'class'
                          ? ts.factory.createPropertyAccessExpression(
                              ts.factory.createIdentifier('instance'),
                              ts.factory.createIdentifier(requestName)
                            )
                          : ts.factory.createIdentifier(requestName),
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
                  // ...settings?.params
                  ts.factory.createSpreadAssignment(
                    ts.factory.createPropertyAccessChain(
                      ts.factory.createIdentifier('settings'),
                      ts.factory.createToken(ts.SyntaxKind.QuestionDotToken),
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

  hookFile.add(importUseMutation);
  hookFile.add(importTanstackMutationSettings);

  if (plugin.config.groupBy === 'class') {
    // import { instance } from '../../instance.gen';
    hookFile.add(
      getImportInstance({
        output: plugin.output,
        folderPath: hookFolderPath,
        generateOutput: plugin.config.generateOutput
      })
    );
  }
  if (plugin.config.groupBy !== 'class') {
    // import type { requestName } from './requestName.gen';
    hookFile.add(
      getImportRequest({
        folderPath: hookFolderPath,
        requestFilePath,
        requestName,
        generateOutput: plugin.config.generateOutput
      })
    );
  }

  hookFile.add(hookFunction);
};
