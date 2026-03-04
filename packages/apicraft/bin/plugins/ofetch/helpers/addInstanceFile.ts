import type { DefinePlugin } from '@hey-api/openapi-ts';

import nodePath from 'node:path';
import ts from 'typescript';

import { getImportOfetch } from './getImportOfetch';

export const addInstanceFile = (plugin: DefinePlugin['Instance']) => {
  const instanceFile = plugin.createFile({
    id: 'ofetchInstance',
    path: nodePath.normalize(`${plugin.output}/instance`)
  });

  // import ofetch from 'ofetch';
  const importOfetch = getImportOfetch();

  // export const instance = ofetch.create();
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
              ts.factory.createIdentifier('ofetch'),
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

  instanceFile.add(importOfetch);
  instanceFile.add(createInstance);
};
