import nodePath from 'node:path';
import ts from 'typescript';

import {
  capitalize,
  generateRequestName,
  getApicraftTypeImport,
  getImportRuntimeInstance,
  getImportRuntimeResponseType,
  getImportTypes,
  getRequestInfo,
  getRequestReturnType,
  hasRuntimeResponseType
} from '@/bin/plugins/helpers';

import type { OFetchPlugin } from '../types';

import {
  getImportOfetch,
  getImportOfetchTypes,
  getOfetchInstanceType,
  getOfetchRequestCallExpression,
  getOfetchRequestParameterDeclaration,
  getOfetchRequestParamsType
} from '../helpers';

const CLASS_NAME = 'ApiInstance';

export const classHandler: OFetchPlugin['Handler'] = ({ plugin }) => {
  const classFilePath = nodePath.normalize(`${plugin.output}/instance`);
  const classFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${classFilePath}`);
  const classFile = plugin.createFile({
    id: 'ofetchInstance',
    path: classFilePath
  });

  const typeImportNames = new Set<string>();
  const typeStatements: ts.Statement[] = [];
  const classElements: ts.ClassElement[] = [];
  const useRuntimeResponseType =
    !!plugin.config.runtimeInstancePath &&
    hasRuntimeResponseType(plugin.config.runtimeInstancePath);

  plugin.forEach('operation', (event) => {
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
      getOfetchRequestParamsType({
        requestDataTypeName,
        requestParamsTypeName
      })
    );

    const requestReturnType = getRequestReturnType({
      useRuntimeResponseType,
      instanceName: 'ofetch',
      requestInfo,
      requestResponseTypeName,
      requestErrorTypeName
    });

    // ({ path, body, query, config }: RequestParams)
    const requestParameter = getOfetchRequestParameterDeclaration({
      request,
      requestInfo,
      requestParamsTypeName
    });

    const requestBody = ts.factory.createBlock(
      [
        ts.factory.createReturnStatement(
          // this.instance(url, { method, body?, query?, ...config })
          getOfetchRequestCallExpression({
            request,
            requestInfo,
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
        requestReturnType,
        requestBody
      )
    );
  });

  // import type { OFetchRequestParams, ... } from '@siberiacancode/apicraft';
  const importApicraftTypes = getApicraftTypeImport([
    'OFetchRequestParams',
    ...(!useRuntimeResponseType ? ['ApicraftOfetchResponse'] : [])
  ]);

  // import type { RequestData, RequestResponse, ... } from './types.gen';
  const importTypes = getImportTypes({
    typeNames: Array.from(typeImportNames),
    folderPath: classFolderPath,
    generateOutput: plugin.config.generateOutput
  });

  // import type { $Fetch, FetchOptions, FetchRequest, ResponseType } from 'ofetch';
  const importOfetchTypes = getImportOfetchTypes([
    '$Fetch',
    'FetchOptions',
    'FetchRequest',
    'ResponseType'
  ]);
  // interface Instance extends $Fetch {...}
  const instanceType = getOfetchInstanceType();

  // private instance: Instance;
  const classInstanceProperty = ts.factory.createPropertyDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.PrivateKeyword)],
    ts.factory.createIdentifier('instance'),
    undefined,
    ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Instance'), undefined),
    undefined
  );

  // constructor(config?: FetchOptions) { this.instance = ofetch.create(config ?? {}); }
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
                  !plugin.config.runtimeInstancePath
                    ? [
                        ts.factory.createBinaryExpression(
                          ts.factory.createIdentifier('config'),
                          ts.factory.createToken(ts.SyntaxKind.QuestionQuestionToken),
                          ts.factory.createObjectLiteralExpression([], false)
                        )
                      ]
                    : []
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

  classFile.add(importApicraftTypes);
  classFile.add(importTypes);
  classFile.add(importOfetchTypes);

  if (useRuntimeResponseType) {
    // import type { ApicraftApiResponse } from runtimeInstancePath;
    classFile.add(
      getImportRuntimeResponseType({
        folderPath: classFolderPath,
        runtimeInstancePath: plugin.config.runtimeInstancePath!
      })
    );
  }
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
    // import { ofetch } from 'ofetch';
    classFile.add(getImportOfetch());
  }

  classFile.add(instanceType);
  typeStatements.forEach((alias) => classFile.add(alias));
  classFile.add(classDeclaration);
  classFile.add(classInstance);
};
