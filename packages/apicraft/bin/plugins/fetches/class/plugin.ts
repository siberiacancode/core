import nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportRuntimeInstance,
  getImportTypes,
  getRequestInfo
} from '@/bin/plugins/helpers';

import type { FetchesPlugin } from '../types';

import {
  getFetchesRequestCallExpression,
  getFetchesRequestParameterDeclaration,
  getFetchesRequestParamsType,
  getImportFetches
} from '../helpers';

const CLASS_NAME = 'ApiInstance';

export const classHandler: FetchesPlugin['Handler'] = ({ plugin }) => {
  const classFilePath = nodePath.normalize(`${plugin.output}/instance`);
  const classFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${classFilePath}`);
  const classFile = plugin.createFile({
    id: 'fetchesInstance',
    path: classFilePath
  });

  const typeImportNames = new Set<string>();
  const typeStatements: ts.Statement[] = [];
  const classElements: ts.ClassElement[] = [];

  plugin.forEach('operation', (event) => {
    if (event.type !== 'operation') return;

    const request = event.operation;
    const requestName = generateRequestName(request, plugin.config.nameBy);
    const requestInfo = getRequestInfo(request);

    const requestDataTypeName = `${capitalize(request.id)}Data`;
    typeImportNames.add(requestDataTypeName);

    const requestResponseTypeName = `${capitalize(request.id)}Response`;
    if (requestInfo.hasSuccessResponse) typeImportNames.add(requestResponseTypeName);
    const requestErrorTypeName = `${capitalize(request.id)}Error`;
    if (requestInfo.hasErrorResponse) typeImportNames.add(requestErrorTypeName);

    const requestParamsTypeName = `${capitalize(requestName)}RequestParams`;
    typeStatements.push(
      getFetchesRequestParamsType({
        requestDataTypeName,
        requestParamsTypeName
      })
    );

    // ({ path, body, query, config }: RequestParams)
    const requestParameter = getFetchesRequestParameterDeclaration({
      request,
      requestInfo,
      requestParamsTypeName
    });

    const requestBody = ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          // this.instance.call(method, url, { body?, query?, ...config })
          getFetchesRequestCallExpression({
            request,
            requestInfo,
            requestResponseTypeName,
            requestErrorTypeName,
            groupBy: plugin.config.groupBy
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

  // import type { RequestData, RequestResponse, ... } from './types.gen';
  const importTypes = getImportTypes({
    typeNames: Array.from(typeImportNames),
    folderPath: classFolderPath,
    generateOutput: plugin.config.generateOutput,
    groupBy: plugin.config.groupBy
  });

  // import type { FetchesRequestParams } from '@siberiacancode/apicraft';
  const importFetchesRequestParams = getApicraftTypeImport('FetchesRequestParams');

  // import type { FetchesInstance, FetchesParams } from '@siberiacancode/fetches';
  const importFetchesTypes = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('FetchesInstance')
        ),
        ...(!plugin.config.runtimeInstancePath
          ? [
              ts.factory.createImportSpecifier(
                false,
                undefined,
                ts.factory.createIdentifier('FetchesParams')
              )
            ]
          : [])
      ])
    ),
    ts.factory.createStringLiteral('@siberiacancode/fetches'),
    undefined
  );

  // private instance: FetchesInstance;
  const classInstanceProperty = ts.factory.createPropertyDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
    ts.factory.createIdentifier('instance'),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('FetchesInstance'), undefined),
    undefined
  );

  // constructor(config?: FetchesParams) { this.instance = fetches.create(config); }
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
              ts.factory.createIdentifier('FetchesParams'),
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
                    ts.factory.createIdentifier('fetches'),
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

  classFile.add(importFetchesRequestParams);
  classFile.add(importTypes);
  classFile.add(importFetchesTypes);

  if (plugin.config.runtimeInstancePath) {
    // import { instance as runtimeInstance } from runtimeInstancePath;
    classFile.add(
      getImportRuntimeInstance({
        folderPath: classFolderPath,
        runtimeInstancePath: plugin.config.runtimeInstancePath
      })
    );
  }
  if (!plugin.config.runtimeInstancePath) {
    // import fetches from '@siberiacancode/fetches';
    classFile.add(getImportFetches());
  }

  typeStatements.forEach((alias) => classFile.add(alias));
  classFile.add(classDeclaration);
  classFile.add(classInstance);
};
