import type { DefinePlugin } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { normalizePath } from '../../helpers';

export const addInstanceFile = (plugin: DefinePlugin['Instance']) => {
  const instanceFile = plugin.createFile({
    id: 'fetchesInstance',
    path: normalizePath(`${plugin.output}/instance`)
  });

  // import fetches from '@siberiacancode/fetches';
  const importFetches = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('fetches'), undefined),
    ts.factory.createStringLiteral('@siberiacancode/fetches')
  );

  // export const instance = fetches.create({ baseURL: '/' });
  const createInstance = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('instance'),
          undefined,
          undefined,
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('fetches'),
              ts.factory.createIdentifier('create')
            ),
            undefined,
            undefined
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  instanceFile.add(importFetches);
  instanceFile.add(createInstance);
};
