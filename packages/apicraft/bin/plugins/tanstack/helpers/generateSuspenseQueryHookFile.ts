import type { DefinePlugin, IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  getImportInstance,
  getImportRequest,
  getRequestInfo
} from '@/bin/plugins/helpers';

import type { TanstackPluginConfig } from '../types';

import { getRequestParamsHookKeys } from './getRequestParamsHookKeys';

interface GenerateSuspenseQueryHookParams {
  plugin: Parameters<DefinePlugin<TanstackPluginConfig>['Handler']>[0]['plugin'];
  request: IR.OperationObject;
  requestFilePath: string;
  requestName: string;
}

export const generateSuspenseQueryHookFile = ({
  plugin,
  request,
  requestName,
  requestFilePath
}: GenerateSuspenseQueryHookParams) => {
  const requestInfo = getRequestInfo({ request });

  const hookName = `use${capitalize(requestName)}SuspenseQuery`;
  const hookFilePath = `${nodePath.dirname(requestFilePath).replace('requests', 'hooks')}/${hookName}`;
  const hookFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${hookFilePath}`);
  const hookFile = plugin.createFile({
    id: hookName,
    path: hookFilePath
  });

  // import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
  const importUseSuspenseQuery = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('queryOptions')
        ),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('useSuspenseQuery')
        )
      ])
    ),
    ts.factory.createStringLiteral('@tanstack/react-query')
  );

  // import type { TanstackSuspenseQuerySettings } from '@siberiacancode/apicraft';
  const importTanstackSuspenseQuerySettings = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('TanstackSuspenseQuerySettings')
        )
      ])
    ),
    ts.factory.createStringLiteral('@siberiacancode/apicraft')
  );

  const optionsFunctionName = `${requestName}Options`;
  const requestParamsHookKeys = getRequestParamsHookKeys(request);

  // const requestNameOptions = queryOptions({...})
  const optionsFunction = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier(optionsFunctionName),
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
                !requestInfo.hasRequiredParam
                  ? ts.factory.createToken(ts.SyntaxKind.QuestionToken)
                  : undefined,
                ts.factory.createTypeReferenceNode(
                  ts.factory.createIdentifier('TanstackSuspenseQuerySettings'),
                  [
                    ts.factory.createTypeQueryNode(
                      plugin.config.instanceVariant === 'class'
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
            ts.factory.createCallExpression(
              ts.factory.createIdentifier('queryOptions'),
              undefined,
              [
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
                                  !requestInfo.hasRequiredParam
                                    ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                    : undefined,
                                  ts.factory.createIdentifier('request')
                                ),
                                !requestInfo.hasRequiredParam
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
                                  !requestInfo.hasRequiredParam
                                    ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                                    : undefined,
                                  ts.factory.createIdentifier('request')
                                ),
                                !requestInfo.hasRequiredParam
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
                          plugin.config.instanceVariant === 'class'
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
                                    !requestInfo.hasRequiredParam
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
                        !requestInfo.hasRequiredParam
                          ? ts.factory.createToken(ts.SyntaxKind.QuestionDotToken)
                          : undefined,
                        ts.factory.createIdentifier('params')
                      )
                    )
                  ],
                  true
                )
              ]
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

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
                ts.factory.createToken(ts.SyntaxKind.DotDotDotToken),
                ts.factory.createIdentifier('args'),
                undefined,
                ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Parameters'), [
                  ts.factory.createTypeQueryNode(ts.factory.createIdentifier(optionsFunctionName))
                ])
              )
            ],
            undefined,
            ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            ts.factory.createCallExpression(
              ts.factory.createIdentifier('useSuspenseQuery'),
              undefined,
              [
                ts.factory.createCallExpression(
                  ts.factory.createIdentifier(optionsFunctionName),
                  undefined,
                  [ts.factory.createSpreadElement(ts.factory.createIdentifier('args'))]
                )
              ]
            )
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  hookFile.add(importUseSuspenseQuery);
  hookFile.add(importTanstackSuspenseQuerySettings);

  if (plugin.config.instanceVariant === 'function') {
    // import type { requestName } from './requestName.gen';
    hookFile.add(
      getImportRequest({
        hookFolderPath,
        requestFilePath,
        requestName,
        generateOutput: plugin.config.generateOutput
      })
    );
  }
  if (plugin.config.instanceVariant === 'class') {
    // import { instance } from '../../instance.gen';
    hookFile.add(
      getImportInstance({
        output: plugin.output,
        folderPath: hookFolderPath,
        generateOutput: plugin.config.generateOutput
      })
    );
  }

  hookFile.add(optionsFunction);
  hookFile.add(hookFunction);
};
