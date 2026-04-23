import nodePath from 'node:path';
import ts from 'typescript';

import { getImportTypes, getRelativePath } from '@/bin/plugins/helpers';

import type { GenerateFakerFileParams } from './types';

import { identifier } from './ast';
import { createImport } from './imports';
import { getSchemaRecords } from './records';
import { createClassStatements, createStandaloneFunction } from './statements';

export const generateFakerFile = ({ mode, plugin }: GenerateFakerFileParams) => {
  const schemas = getSchemaRecords(plugin);
  if (!schemas.length) return;

  const fakerFilePath = nodePath.normalize(`${plugin.output}/faker`);
  const fakerFolderPath = nodePath.dirname(`${plugin.config.generateOutput}/${fakerFilePath}`);
  const runtimeFakerImportPath = plugin.config.runtimeFakerInstancePath
    ? getRelativePath(fakerFolderPath, plugin.config.runtimeFakerInstancePath)
    : undefined;
  const defaultFakerIdentifier = runtimeFakerImportPath ? 'runtimeFaker' : 'faker';
  const schemaMap = new Map(schemas.map((schema) => [schema.name, schema]));

  const fakerFile = plugin.createFile({
    id: 'faker',
    path: fakerFilePath
  });

  if (runtimeFakerImportPath) {
    fakerFile.add(
      createImport({
        module: runtimeFakerImportPath,
        specifiers: [
          ts.factory.createImportSpecifier(false, identifier('faker'), identifier('runtimeFaker'))
        ]
      })
    );
  } else {
    fakerFile.add(
      createImport({
        module: '@faker-js/faker',
        specifiers: [ts.factory.createImportSpecifier(false, undefined, identifier('faker'))]
      })
    );
  }

  if (mode === 'class') {
    fakerFile.add(
      createImport({
        isTypeOnly: true,
        module: '@faker-js/faker',
        specifiers: [ts.factory.createImportSpecifier(false, undefined, identifier('Faker'))]
      })
    );
  }

  fakerFile.add(
    createImport({
      module: '@siberiacancode/apicraft',
      specifiers: [ts.factory.createImportSpecifier(false, undefined, identifier('deepMerge'))]
    })
  );

  fakerFile.add(
    getImportTypes({
      typeNames: schemas.map((schema) => schema.typeName),
      folderPath: fakerFolderPath,
      generateOutput: plugin.config.generateOutput
    })
  );

  if (mode === 'class') {
    createClassStatements({
      defaultFakerIdentifier,
      schemaMap,
      schemas
    }).forEach((statement) => fakerFile.add(statement));
    return;
  }

  for (const schema of schemas) {
    fakerFile.add(
      createStandaloneFunction({
        fakerRoot: identifier(defaultFakerIdentifier),
        schema,
        schemaMap
      })
    );
  }
};
