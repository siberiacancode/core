import type { IR } from '@hey-api/openapi-ts';
import type ts from 'typescript';

import nodePath from 'node:path';

import {
  capitalize,
  getApicraftImport,
  getImportTypes,
  normalizeName
} from '@/bin/plugins/helpers';

import type { FakerPlugin } from './types';

import {
  getArrayObjectFakerFunction,
  getFakerImport,
  getImportFakerRuntimeInstance,
  getObjectFakerFunction,
  getPrimitiveFakerFunction
} from './helpers';

export const IGNORED_SCHEMA_TYPES: IR.SchemaObject['type'][] = [
  'never',
  'null',
  'tuple',
  'undefined',
  'unknown',
  'void'
];

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

    if (
      IGNORED_SCHEMA_TYPES.includes(schema.type) ||
      (schema.type === 'array' && IGNORED_SCHEMA_TYPES.includes(schema.items?.[0].type))
    ) {
      return;
    }

    const typeName = capitalize(normalizeName(name));
    typeImportNames.add(typeName);

    if (schema.type === 'object') {
      // export const createTypeName = (overrides?: Partial<TypeName>): TypeName => deepMerge<TypeName>({...}, overrides)
      const fakerFunction = getObjectFakerFunction({ schema, schemaName: name, typeName });
      fakerStatements.push(fakerFunction);

      return;
    }

    if (schema.type === 'array' && schema.items?.[0].type === 'object') {
      // export const createTypeName = (overrides?: TypeName): TypeName => overrides ?? [{...}]
      const fakerFunction = getArrayObjectFakerFunction({ schema, schemaName: name, typeName });
      fakerStatements.push(fakerFunction);

      return;
    }

    // export const createTypeName = (overrides?: TypeName): TypeName => overrides ?? faker
    const fakerFunction = getPrimitiveFakerFunction({ schema, schemaName: name, typeName });
    fakerStatements.push(fakerFunction);
  });

  if (plugin.config.runtimeInstancePath) {
    // import { faker } from runtimeInstancePath;
    fakersFile.add(
      getImportFakerRuntimeInstance({
        folderPath: fakersFolderPath,
        runtimeInstancePath: plugin.config.runtimeInstancePath
      })
    );
  }
  if (!plugin.config.runtimeInstancePath) {
    // import { faker } from '@faker-js/faker';
    fakersFile.add(getFakerImport());
  }
  // import { deepMerge } from '@siberiacancode/apicraft';
  fakersFile.add(getApicraftImport('deepMerge'));
  // import type { TypeA, TypeB, ... } from './types.gen';
  fakersFile.add(
    getImportTypes({
      typeNames: [...typeImportNames],
      folderPath: fakersFolderPath,
      generateOutput: plugin.config.generateOutput
    })
  );

  fakerStatements.forEach((statement) => fakersFile.add(statement));
};
