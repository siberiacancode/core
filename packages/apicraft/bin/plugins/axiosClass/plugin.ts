import * as nodePath from 'node:path';
import ts from 'typescript';

import type { AxiosClassPlugin } from './types';

import {
  capitalize,
  generateRequestName,
  getAxiosRequestCallExpression,
  getAxiosRequestParameterDeclaration,
  getAxiosRequestParamsType,
  getImportAxios,
  getImportAxiosRequestParams,
  getRequestInfo
} from '../helpers';
import { getImportRuntimeInstance } from './helpers';

const CLASS_NAME = 'ApiInstance';

export const handler: AxiosClassPlugin['Handler'] = ({ plugin }) => {
  const classFilePath = nodePath.normalize(`${plugin.output}/instance`);
  const classFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${classFilePath}`);
  const classFile = plugin.createFile({
    id: 'axiosInstance',
    path: classFilePath
  });

  const typeImportNames = new Set<string>();
  const typeStatements: ts.Statement[] = [];
  const classElements: ts.ClassElement[] = [];

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestInfo = getRequestInfo({ request });

    const requestDataTypeName = `${capitalize(request.id)}Data`;
    typeImportNames.add(requestDataTypeName);

    const requestResponseTypeName = `${capitalize(request.id)}Response`;
    if (requestInfo.hasResponse) typeImportNames.add(requestResponseTypeName);

    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
    typeStatements.push(
      getAxiosRequestParamsType({
        requestDataTypeName,
        requestParamsTypeName
      })
    );

    // ({ path, body, query, config }: RequestParams)
    const requestParameter = getAxiosRequestParameterDeclaration({
      request,
      requestInfo,
      requestParamsTypeName
    });

    const requestBody = ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          // instance.request({ method, url, data, params })
          getAxiosRequestCallExpression({
            request,
            requestInfo,
            requestResponseTypeName,
            instanceVariant: 'class'
          })
        )
      ],
      true
    );

    classElements.push(
      ts.factory.createMethodDeclaration(
        undefined,
        undefined,
        ts.factory.createIdentifier(requestName),
        undefined,
        undefined,
        [requestParameter],
        undefined,
        requestBody
      )
    );
  });

  // import type { AxiosRequestParams } from '@siberiacancode/apicraft';
  const importAxiosRequestParams = getImportAxiosRequestParams();

  // import type { RequestData, RequestResponse, ... } from './types.gen';
  const importTypes = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        Array.from(typeImportNames).map((typeImportName) =>
          ts.factory.createImportSpecifier(
            false,
            undefined,
            ts.factory.createIdentifier(typeImportName)
          )
        )
      )
    ),
    ts.factory.createStringLiteral('./types.gen')
  );

  // import type { AxiosInstance, CreateAxiosDefaults } from 'axios';
  const importAxiosTypes = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('AxiosInstance')
        ),
        ...(!plugin.config.runtimeInstancePath
          ? [
              ts.factory.createImportSpecifier(
                false,
                undefined,
                ts.factory.createIdentifier('CreateAxiosDefaults')
              )
            ]
          : [])
      ])
    ),
    ts.factory.createStringLiteral('axios'),
    undefined
  );

  // private instance: AxiosInstance;
  const classInstanceProperty = ts.factory.createPropertyDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
    ts.factory.createIdentifier('instance'),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('AxiosInstance'), undefined),
    undefined
  );

  // constructor(config?: CreateAxiosDefaults) { this.instance = axios.create(config); }
  const constructorDeclaration = ts.factory.createConstructorDeclaration(
    undefined,
    !plugin.config.runtimeInstancePath
      ? [
          ts.factory.createParameterDeclaration(
            undefined,
            undefined,
            ts.factory.createIdentifier('config'),
            ts.factory.createToken(ts.SyntaxKind.QuestionToken),
            ts.factory.createTypeReferenceNode(
              ts.factory.createIdentifier('CreateAxiosDefaults'),
              undefined
            ),
            undefined
          )
        ]
      : [],
    ts.factory.createBlock(
      [
        ts.factory.createExpressionStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createThis(),
              ts.factory.createIdentifier('instance')
            ),
            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
            plugin.config.runtimeInstancePath
              ? ts.factory.createIdentifier('runtimeInstance')
              : ts.factory.createCallExpression(
                  ts.factory.createPropertyAccessExpression(
                    ts.factory.createIdentifier('axios'),
                    ts.factory.createIdentifier('create')
                  ),
                  undefined,
                  !plugin.config.runtimeInstancePath ? [ts.factory.createIdentifier('config')] : []
                )
          )
        )
      ],
      true
    )
  );

  // export class ApiInstance {...}
  const classDeclaration = ts.factory.createClassDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(CLASS_NAME),
    undefined,
    undefined,
    [classInstanceProperty, constructorDeclaration, ...classElements]
  );

  // export const instance = new ApiInstance();
  const classInstance = ts.factory.createVariableStatement(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createVariableDeclarationList(
      [
        ts.factory.createVariableDeclaration(
          ts.factory.createIdentifier('instance'),
          undefined,
          undefined,
          ts.factory.createNewExpression(ts.factory.createIdentifier(CLASS_NAME), undefined, [])
        )
      ],
      ts.NodeFlags.Const
    )
  );

  classFile.add(importAxiosRequestParams);
  classFile.add(importTypes);
  classFile.add(importAxiosTypes);

  if (!plugin.config.runtimeInstancePath) {
    // import axios from 'axios';
    classFile.add(getImportAxios());
  }
  if (plugin.config.runtimeInstancePath) {
    // import { instance as runtimeInstance } from runtimeInstancePath;
    classFile.add(
      getImportRuntimeInstance({
        classFolderPath,
        runtimeInstancePath: plugin.config.runtimeInstancePath
      })
    );
  }

  typeStatements.forEach((alias) => classFile.add(alias));
  classFile.add(classDeclaration);
  classFile.add(classInstance);
};
