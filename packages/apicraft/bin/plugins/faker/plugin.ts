import nodePath from 'node:path';
import ts from 'typescript';

import { capitalize, getApicraftImport, getImportTypes } from '@/bin/plugins/helpers';

import type { FakerPlugin } from './types';

import { getFakerImport, getFakerValue } from './helpers';

export const handler: FakerPlugin['Handler'] = ({ plugin }) => {
  const fakersFilePath = nodePath.normalize(`${plugin.output}/fakers`);
  const fakersFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${fakersFilePath}`);

  const fakersFile = plugin.createFile({
    id: 'fakers',
    path: fakersFilePath
  });

  const typeImportNames = new Set<string>();
  const fakerStatements: ts.Statement[] = [];

  plugin.forEach('schema', (event) => {
    const { name, schema } = event;
    if (schema.type !== 'object' || !schema.properties) return;

    const typeName = capitalize(name);
    typeImportNames.add(typeName);

    const propertyAssignments = Object.entries(schema.properties).map(([propName, propSchema]) =>
      ts.factory.createPropertyAssignment(
        ts.factory.createIdentifier(propName),
        getFakerValue(propName, propSchema)
      )
    );

    // export const createTypeName = (overrides?: Partial<TypeName>): TypeName => deepMerge<TypeName>({...}, overrides)
    const fakerFunction = ts.factory.createVariableStatement(
      [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
      ts.factory.createVariableDeclarationList(
        [
          ts.factory.createVariableDeclaration(
            ts.factory.createIdentifier(`create${typeName}`),
            undefined,
            undefined,
            ts.factory.createArrowFunction(
              undefined,
              undefined,
              [
                ts.factory.createParameterDeclaration(
                  undefined,
                  undefined,
                  ts.factory.createIdentifier('overrides'),
                  ts.factory.createToken(ts.SyntaxKind.QuestionToken),
                  ts.factory.createTypeReferenceNode(ts.factory.createIdentifier('Partial'), [
                    ts.factory.createTypeReferenceNode(
                      ts.factory.createIdentifier(typeName),
                      undefined
                    )
                  ]),
                  undefined
                )
              ],
              ts.factory.createTypeReferenceNode(ts.factory.createIdentifier(typeName), undefined),
              ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
              ts.factory.createCallExpression(
                ts.factory.createIdentifier('deepMerge'),
                [
                  ts.factory.createTypeReferenceNode(
                    ts.factory.createIdentifier(typeName),
                    undefined
                  )
                ],
                [
                  ts.factory.createObjectLiteralExpression(propertyAssignments, true),
                  ts.factory.createIdentifier('overrides')
                ]
              )
            )
          )
        ],
        ts.NodeFlags.Const
      )
    );

    fakerStatements.push(fakerFunction);
  });

  // import { faker } from '@faker-js/faker';
  fakersFile.add(getFakerImport());
  // import { deepMerge } from '@siberiacancode/apicraft';
  fakersFile.add(getApicraftImport('deepMerge'));
  // import type { TypeA, TypeB, ... } from './types.gen';
  fakersFile.add(
    getImportTypes({
      typeNames: Array.from(typeImportNames),
      folderPath: fakersFolderPath,
      generateOutput: plugin.config.generateOutput
    })
  );

  fakerStatements.forEach((statement) => fakersFile.add(statement));
};
