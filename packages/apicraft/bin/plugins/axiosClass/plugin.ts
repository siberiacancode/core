import type { IR } from '@hey-api/openapi-ts';

import * as nodePath from 'node:path';
import ts from 'typescript';

import {} from '@/bin/helpers';

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

interface RequestMeta {
  request: IR.OperationObject;
  requestName: string;
}

const CLASS_NAME = 'ApiInstance';

export const handler: AxiosClassPlugin['Handler'] = ({ plugin }) => {
  const requests: RequestMeta[] = [];

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);

    requests.push({ request, requestName });
  });
  if (!requests.length) return;

  const classFilePath = nodePath.normalize(`${plugin.output}/instance`);
  const classFile = plugin.createFile({
    id: 'axiosInstance',
    path: classFilePath
  });

  const classFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${classFilePath}`);

  const typeImportNames = new Set<string>();
  const typeAliases: ts.Statement[] = [];
  const classMembers: ts.ClassElement[] = [];

  requests.forEach(({ request, requestName }) => {
    const requestInfo = getRequestInfo({ request });

    const requestDataTypeName = `${capitalize(request.id)}Data`;
    typeImportNames.add(requestDataTypeName);

    const requestResponseTypeName = `${capitalize(request.id)}Response`;
    if (requestInfo.hasResponse) typeImportNames.add(requestResponseTypeName);

    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
    typeAliases.push(
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

    classMembers.push(
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

  const importTypes = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        Array.from(typeImportNames).map((specifier) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(specifier))
        )
      )
    ),
    ts.factory.createStringLiteral(
      nodePath.relative(
        classFolderPath,
        nodePath.normalize(`${plugin.config.generateOutput}/types.gen`)
      )
    )
  );

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
        )
      ])
    ),
    ts.factory.createStringLiteral('axios')
  );

  const classInstanceProperty = ts.factory.createPropertyDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
    ts.factory.createIdentifier('instance'),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('AxiosInstance'), undefined),
    undefined
  );

  const constructorDeclaration = ts.factory.createConstructorDeclaration(
    undefined,
    [],
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
              undefined
            )
          )
        )
      ],
      true
    )
  );

  const classDeclaration = ts.factory.createClassDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(CLASS_NAME),
    undefined,
    undefined,
    [classInstanceProperty, constructorDeclaration, ...classMembers]
  );

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
  typeAliases.forEach((alias) => classFile.add(alias));
  classFile.add(classDeclaration);
  classFile.add(classInstance);
};
