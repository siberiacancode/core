import type { DefinePlugin } from '@hey-api/openapi-ts';

import nodePath from 'node:path';
import ts from 'typescript';

import { getImportOfetch } from './getImportOfetch';
import { getImportOfetchTypes } from './getImportOfetchTypes';
import { getOfetchInstanceType } from './getOfetchInstanceType';

export const addInstanceFile = (plugin: DefinePlugin['Instance']) => {
  const instanceFile = plugin.createFile({
    id: 'ofetchInstance',
    path: nodePath.normalize(`${plugin.output}/instance`)
  });

  // import { ofetch } from 'ofetch';
  const importOfetch = getImportOfetch();
  // import type { $Fetch, FetchOptions, FetchRequest, ResponseType } from 'ofetch';
  const importOfetchTypes = getImportOfetchTypes([
    '$Fetch',
    'FetchOptions',
    'FetchRequest',
    'ResponseType'
  ]);
  // interface Instance extends $Fetch {...}
  const instanceType = getOfetchInstanceType();

  // export const instance: Instance = ofetch.create({});
  const createInstance = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('instance'),
          undefined,
          ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Instance'), undefined),
          ts.factory.createCallExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createIdentifier('ofetch'),
              ts.factory.createIdentifier('create')
            ),
            undefined,
            [ts.factory.createObjectLiteralExpression([], false)]
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  instanceFile.add(importOfetch);
  instanceFile.add(importOfetchTypes);
  instanceFile.add(instanceType);
  instanceFile.add(createInstance);
};
