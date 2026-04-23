import type { FakerPlugin } from '../types';

export interface GenerateFakerFileParams {
  mode: 'class' | 'standalone';
  plugin: FakerPlugin['Instance'];
}

export interface SchemaObject {
  [key: string]: unknown;
}

export interface SchemaRecord {
  functionName: string;
  name: string;
  schema: SchemaObject;
  typeName: string;
}
