import { capitalize, normalizeName } from '@/bin/plugins/helpers';

import type { FakerPlugin } from '../types';
import type { SchemaRecord } from './types';

import { toSchemaObject } from './schema';

const toPascalCase = (value: string) => capitalize(normalizeName(value));

export const getSchemaRecords = (plugin: FakerPlugin['Instance']) => {
  const records: SchemaRecord[] = [];

  plugin.forEach('schema', (event) => {
    records.push({
      name: event.name,
      typeName: event.name,
      functionName: `create${toPascalCase(event.name)}`,
      schema: toSchemaObject(event.schema)
    });
  });

  return records;
};
