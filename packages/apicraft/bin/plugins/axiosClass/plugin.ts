import * as nodePath from 'node:path';
import ts from 'typescript';

import type { AxiosClassPlugin } from './types';

import {
  capitalize,
  generateRequestName,
  getAxiosRequestCallExpression,
  getAxiosRequestParameterDeclaration,
  getAxiosRequestParamsType,
  getImportAxiosRequestParams,
  getRequestInfo
} from '../helpers';

const CLASS_NAME = 'ApiInstance';

export const handler: AxiosClassPlugin['Handler'] = ({ plugin }) => {
  const classFilePath = nodePath.normalize(`${plugin.output}/instance`);
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

    const requestParameter = getAxiosRequestParameterDeclaration({
      request,
      requestInfo,
      requestParamsTypeName
    });

    const requestBody = ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          getAxiosRequestCallExpression({
            request,
            requestInfo,
            requestResponseTypeName,
            variant: 'class'
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

  // import axios, { AxiosInstance, CreateAxiosDefaults } from 'axios';
  const importAxios = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      ts.factory.createIdentifier('axios'),
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('AxiosInstance')
        ),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('CreateAxiosDefaults')
        )
      ])
    ),
    ts.factory.createStringLiteral('axios')
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
    [
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
    ],
    ts.factory.createBlock(
      [
        ts.factory.createExpressionStatement(
          ts.factory.createBinaryExpression(
            ts.factory.createPropertyAccessExpression(
              ts.factory.createThis(),
              ts.factory.createIdentifier('instance')
            ),
            ts.factory.createToken(ts.SyntaxKind.EqualsToken),
            ts.factory.createCallExpression(
              ts.factory.createPropertyAccessExpression(
                ts.factory.createIdentifier('axios'),
                ts.factory.createIdentifier('create')
              ),
              undefined,
              [ts.factory.createIdentifier('config')]
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
  classFile.add(importAxios);
  typeStatements.forEach((alias) => classFile.add(alias));
  classFile.add(classDeclaration);
  classFile.add(classInstance);
};
