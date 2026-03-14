import nodePath from 'node:path';
import ts from 'typescript';

import type { AxiosPlugin } from '../types';

import { getImportAxios } from './getImportAxios';

export const addInstanceFile = (plugin: AxiosPlugin['Instance']) => {
  const instanceFile = plugin.createFile({
    id: 'axiosInstance',
    path: nodePath.normalize(`${plugin.output}/instance`)
  });

  // import axios from 'axios';
  const importAxios = getImportAxios();

  // export const instance = axios.create({ baseURL: '/api/v1' });
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

  instanceFile.add(importAxios);
  instanceFile.add(createInstance);
};
