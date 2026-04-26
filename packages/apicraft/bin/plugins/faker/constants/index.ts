import type { IR } from '@hey-api/openapi-ts';

export const PRIMITIVE_SCHEMA_TYPES: IR.SchemaObject['type'][] = [
  'boolean',
  'number',
  'string',
  'enum',
  'integer'
];

export const IGNORED_SCHEMA_TYPES: IR.SchemaObject['type'][] = [
  'never',
  'null',
  'tuple',
  'undefined',
  'unknown',
  'void'
];
