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

import type { OfetchPlugin } from '../types';

import {
  getImportOfetch,
  getOfetchRequestCallExpression,
  getOfetchRequestParameterDeclaration,
  getOfetchRequestParamsType
} from '../helpers';

const CLASS_NAME = 'ApiInstance';

export const classHandler: OfetchPlugin['Handler'] = ({ plugin }) => {
  const classFilePath = nodePath.normalize(`${plugin.output}/instance`);
  const classFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${classFilePath}`);
  const classFile = plugin.createFile({
    id: 'ofetchInstance',
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
      getOfetchRequestParamsType({
        requestDataTypeName,
        requestParamsTypeName
      })
    );

    const requestParameter = getOfetchRequestParameterDeclaration({
      request,
      requestInfo,
      requestParamsTypeName
    });

    const requestBody = ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          getOfetchRequestCallExpression({
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

  const importOfetchRequestParams = getApicraftTypeImport('OfetchRequestParams');

  const importTypes = getImportTypes({
    typeNames: Array.from(typeImportNames),
    folderPath: classFolderPath,
    generateOutput: plugin.config.generateOutput,
    groupBy: plugin.config.groupBy
  });

  // import type { $Fetch, FetchOptions } from 'ofetch';
  const importOfetchTypes = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('$Fetch')),
        ...(!plugin.config.runtimeInstancePath
          ? [
              ts.factory.createImportSpecifier(
                false,
                undefined,
                ts.factory.createIdentifier('FetchOptions')
              )
            ]
          : [])
      ])
    ),
    ts.factory.createStringLiteral('ofetch'),
    undefined
  );

  // private instance: $Fetch;
  const classInstanceProperty = ts.factory.createPropertyDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
    ts.factory.createIdentifier('instance'),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('$Fetch'), undefined),
    undefined
  );

  // constructor(config?: FetchOptions) { this.instance = ofetch.create(config); }
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
              ts.factory.createIdentifier('FetchOptions'),
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
                    ts.factory.createIdentifier('ofetch'),
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

  const classDeclaration = ts.factory.createClassDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(CLASS_NAME),
    undefined,
    undefined,
    [classInstanceProperty, constructorDeclaration, ...classElements]
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

  classFile.add(importOfetchRequestParams);
  classFile.add(importTypes);
  classFile.add(importOfetchTypes);

  if (plugin.config.runtimeInstancePath) {
    classFile.add(
      getImportRuntimeInstance({
        folderPath: classFolderPath,
        runtimeInstancePath: plugin.config.runtimeInstancePath
      })
    );
  }
  if (!plugin.config.runtimeInstancePath) {
    classFile.add(getImportOfetch());
  }

  typeStatements.forEach((alias) => classFile.add(alias));
  classFile.add(classDeclaration);
  classFile.add(classInstance);
};
