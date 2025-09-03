import ts from 'typescript';

import type { AxiosPlugin } from './types';

// TODO: rename constants
// TODO: remove any
// TODO: rename func's param name's

const firstCapital = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);
const methodTakesBody = (m: string) => /^(?:post|put|patch)$/i.test(m);

const emitApiInstance = (plugin: any) => {
  const id = 'API_INSTANCE';

  if (plugin.hasFile?.(id)) return;

  const file = plugin.createFile({
    id,
    path: `${plugin.output}/instance`
  });

  const importAxios = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('axios'), undefined),
    ts.factory.createStringLiteral('axios')
  );

  const apiFunc = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          'api',
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('axios'),
              'create'
            ),
            undefined,
            [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    'baseURL',
                    ts.factory.createBinaryExpression(
                      ts.factory.createPropertyAccessExpression(
                        ts.factory.createPropertyAccessExpression(
                          ts.factory.createIdentifier('process'),
                          'env'
                        ),
                        'API_BASE_URL'
                      ),
                      ts.SyntaxKind.QuestionQuestionToken,
                      ts.factory.createStringLiteral('')
                    )
                  )
                ],
                true
              )
            ]
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  file.add(importAxios);
  file.add(apiFunc);
};

export const handler: AxiosPlugin['Handler'] = ({ plugin }) => {
  emitApiInstance(plugin);

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const { operation } = event;
    const operationName = operation.operationId ?? 'unnamedOperation';
    const Name = firstCapital(operationName);
    const method = operation.method.toLowerCase();
    const takesBody = methodTakesBody(method);

    const file = plugin.createFile({
      id: operationName,
      path: `${plugin.output}/${operationName}`
    });

    // --- import { AxiosRequestConfig } from 'axios';
    const importAxios = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier('AxiosRequestConfig')
          )
        ])
      ),
      ts.factory.createStringLiteral('axios')
    );

    // --- import { FooResponse, FooData } from '../types.gen';
    const importTypes = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        true, // typeOnly
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(`${Name}Response`)
          )
          // ...
        ])
      ),
      ts.factory.createStringLiteral('../types.gen')
    );

    // --- import { api } from './instance.gen';
    const importApi = ts.factory.createImportDeclaration(
      undefined,
      ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports([
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('api'))
        ])
      ),
      ts.factory.createStringLiteral('./instance.gen')
    );

    // --- export type XxxConfig = AxiosRequestConfig<XxxData>;
    const typeAlias = ts.factory.createTypeAliasDeclaration(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createIdentifier(`${Name}Config`),
      undefined,
      ts.factory.createTypeReferenceNode(
        'AxiosRequestConfig',
        takesBody ? [ts.factory.createTypeReferenceNode(`${Name}Data`, undefined)] : undefined
      )
    );

    // --- export const foo = async (...) => api.method<Response>(...);
    const params: ts.ParameterDeclaration[] = takesBody
      ? [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            'data',
            undefined,
            ts.factory.createTypeReferenceNode(`${Name}Data`, undefined)
          ),
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            'config',
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createTypeReferenceNode(`${Name}Config`, undefined)
          )
        ]
      : [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            'config',
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createTypeReferenceNode(`${Name}Config`, undefined)
          )
        ];

    const callArgs: ts.Expression[] = takesBody
      ? [
          ts.factory.createStringLiteral(operation.path),
          ts.factory.createIdentifier('data'),
          ts.factory.createIdentifier('config')
        ]
      : [ts.factory.createStringLiteral(operation.path), ts.factory.createIdentifier('config')];

    const funcDecl = ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            operationName,
            undefined,
            undefined,
            ts.factory.createArrowFunction(
              [ts.factory.createModifier(ts.SyntaxKind.AsyncKeyword)],
              undefined,
              params,
              undefined,
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.factory.createCallExpression(
                ts.factory.createPropertyAccessExpression(
                  ts.factory.createIdentifier('api'),
                  method
                ),
                [ts.factory.createTypeReferenceNode(`${Name}Response`, undefined)],
                callArgs
              )
            )
          )
        ],
        ts.NodeFlags.Const
      )
    );

    file.add(importAxios);
    file.add(importTypes);
    file.add(importApi);
    file.add(typeAlias);
    file.add(funcDecl);
  });
};
