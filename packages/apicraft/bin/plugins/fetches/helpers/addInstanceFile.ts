import nodePath from 'node:path';
import ts from 'typescript';

import type { FetchesPlugin } from '../types';

import { getImportFetches } from './getImportFetches';

export const addInstanceFile = (plugin: FetchesPlugin['Instance']) => {
  const instanceFile = plugin.createFile({
    id: 'fetchesInstance',
    path: nodePath.normalize(`${plugin.output}/instance`)
  });

  const importFetches = getImportFetches();

  // export const instance = fetches.create();
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
            plugin.config.baseUrl
              ? [
                  ts.factory.createObjectLiteralExpression(
                    [
                      ts.factory.createPropertyAssignment(
                        ts.factory.createIdentifier('baseURL'),
                        ts.factory.createStringLiteral(plugin.config.baseUrl)
                      )
                    ],
                    false
                  )
                ]
              : undefined
          )
        )
      ],
      ts.NodeFlags.Const
    )
  );

  instanceFile.add(importFetches);
  instanceFile.add(createInstance);
};
