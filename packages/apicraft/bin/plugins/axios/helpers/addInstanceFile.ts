import type { DefinePlugin } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';
import ts from 'typescript';

export const addInstanceFile = (plugin: DefinePlugin['Instance']) => {
  const instanceFile = plugin.createFile({
    id: 'axiosInstance',
    path: nodePath.normalize(`${plugin.output}/instance`)
  });

  // import axios from 'axios';
  const importAxios = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('axios'), undefined),
    ts.factory.createStringLiteral('axios')
  );

  // export const instance = axios.create();
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
              ts.factory.createIdentifier('axios'),
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

  instanceFile.add(importAxios);
  instanceFile.add(createInstance);
};
