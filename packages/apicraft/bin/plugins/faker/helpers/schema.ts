import ts from 'typescript';

import type { SchemaObject, SchemaRecord } from './types';

import {
  createArrayElementCall,
  createCall,
  createFakerAccess,
  createPropertyAccess,
  identifier,
  toExpression,
  toPropertyName
} from './ast';

const REF_PREFIX = '#/components/schemas/';

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export const toSchemaObject = (value: unknown): SchemaObject => (isRecord(value) ? value : {});

const getSchemaNameFromRef = (ref: string) => {
  if (ref.startsWith(REF_PREFIX)) return ref.slice(REF_PREFIX.length);

  const segments = ref.split('/');
  return segments[segments.length - 1] ?? ref;
};

const getEnumValues = (schema: SchemaObject) => {
  const items = Array.isArray(schema.items) ? schema.items : [];

  return items
    .map((item) => (isRecord(item) ? item.const : undefined))
    .filter((item) => item !== undefined);
};

const normalizePropertyKey = (propertyName?: string) =>
  (propertyName ?? '').replace(/[^a-z0-9]/gi, '').toLowerCase();

const buildStringExpression = ({
  fakerRoot,
  propertyName,
  schema
}: {
  fakerRoot: ts.Expression;
  propertyName?: string;
  schema: SchemaObject;
}) => {
  const format = typeof schema.format === 'string' ? schema.format : undefined;
  if (format === 'email') return createCall(createFakerAccess(fakerRoot, 'internet', 'email'));
  if (format === 'uuid') return createCall(createFakerAccess(fakerRoot, 'string', 'uuid'));
  if (format === 'date' || format === 'date-time') {
    return createCall(
      createPropertyAccess(
        createCall(createFakerAccess(fakerRoot, 'date', 'recent')),
        'toISOString'
      )
    );
  }
  if (format === 'uri' || format === 'url') {
    return createCall(createFakerAccess(fakerRoot, 'internet', 'url'));
  }
  if (format === 'ipv4') return createCall(createFakerAccess(fakerRoot, 'internet', 'ipv4'));
  if (format === 'ipv6') return createCall(createFakerAccess(fakerRoot, 'internet', 'ipv6'));

  const normalizedProperty = normalizePropertyKey(propertyName);
  if (normalizedProperty.includes('email')) {
    return createCall(createFakerAccess(fakerRoot, 'internet', 'email'));
  }
  if (normalizedProperty.includes('username')) {
    return createCall(createFakerAccess(fakerRoot, 'internet', 'username'));
  }
  if (normalizedProperty.includes('firstname')) {
    return createCall(createFakerAccess(fakerRoot, 'person', 'firstName'));
  }
  if (normalizedProperty.includes('lastname')) {
    return createCall(createFakerAccess(fakerRoot, 'person', 'lastName'));
  }
  if (normalizedProperty.includes('name')) {
    return createCall(createFakerAccess(fakerRoot, 'person', 'fullName'));
  }
  if (normalizedProperty.includes('createdat')) {
    return createCall(
      createPropertyAccess(createCall(createFakerAccess(fakerRoot, 'date', 'past')), 'toISOString')
    );
  }
  if (normalizedProperty.includes('updatedat')) {
    return createCall(
      createPropertyAccess(
        createCall(createFakerAccess(fakerRoot, 'date', 'recent')),
        'toISOString'
      )
    );
  }

  return createCall(createFakerAccess(fakerRoot, 'lorem', 'word'));
};

const buildUnknownExpression = (fakerRoot: ts.Expression) =>
  createArrayElementCall(fakerRoot, [
    createCall(createFakerAccess(fakerRoot, 'number', 'int')),
    createCall(createFakerAccess(fakerRoot, 'lorem', 'word')),
    ts.factory.createTrue(),
    ts.factory.createFalse(),
    ts.factory.createNull()
  ]);

export const buildSchemaExpression = ({
  fakerRoot,
  propertyName,
  schema,
  schemaMap,
  visitedRefs
}: {
  fakerRoot: ts.Expression;
  propertyName?: string;
  schema: SchemaObject;
  schemaMap: Map<string, SchemaRecord>;
  visitedRefs: Set<string>;
}): ts.Expression => {
  if (schema.default !== undefined) return toExpression(schema.default);

  if (typeof schema.$ref === 'string') {
    const refName = getSchemaNameFromRef(schema.$ref);
    const refSchema = schemaMap.get(refName)?.schema;

    if (!refSchema || visitedRefs.has(refName)) return ts.factory.createObjectLiteralExpression();

    visitedRefs.add(refName);
    const expression = buildSchemaExpression({
      fakerRoot,
      propertyName,
      schema: refSchema,
      schemaMap,
      visitedRefs
    });
    visitedRefs.delete(refName);
    return expression;
  }

  const enumValues = getEnumValues(schema);
  if (schema.type === 'enum' && enumValues.length) {
    if (enumValues.length === 1) return toExpression(enumValues[0]);
    return createArrayElementCall(
      fakerRoot,
      enumValues.map((value) => toExpression(value))
    );
  }

  if (schema.type === 'object') {
    const properties = isRecord(schema.properties) ? Object.entries(schema.properties) : [];

    const objectProperties = properties.map(([key, propertySchema]) =>
      ts.factory.createPropertyAssignment(
        toPropertyName(key),
        buildSchemaExpression({
          fakerRoot,
          propertyName: key,
          schema: toSchemaObject(propertySchema),
          schemaMap,
          visitedRefs
        })
      )
    );

    if (!objectProperties.length && isRecord(schema.additionalProperties)) {
      objectProperties.push(
        ts.factory.createPropertyAssignment(
          identifier('value'),
          buildSchemaExpression({
            fakerRoot,
            propertyName: 'value',
            schema: toSchemaObject(schema.additionalProperties),
            schemaMap,
            visitedRefs
          })
        )
      );
    }

    return ts.factory.createObjectLiteralExpression(objectProperties, true);
  }

  if (schema.type === 'array') {
    const items = Array.isArray(schema.items) ? schema.items.map(toSchemaObject) : [];
    const itemExpression =
      items.length > 0
        ? buildSchemaExpression({
            fakerRoot,
            propertyName,
            schema: items[0]!,
            schemaMap,
            visitedRefs
          })
        : buildUnknownExpression(fakerRoot);

    return createCall(createPropertyAccess(identifier('Array'), 'from'), [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment(
            identifier('length'),
            createCall(createFakerAccess(fakerRoot, 'number', 'int'), [
              ts.factory.createObjectLiteralExpression(
                [
                  ts.factory.createPropertyAssignment(
                    identifier('min'),
                    ts.factory.createNumericLiteral(1)
                  ),
                  ts.factory.createPropertyAssignment(
                    identifier('max'),
                    ts.factory.createNumericLiteral(3)
                  )
                ],
                false
              )
            ])
          )
        ],
        false
      ),
      ts.factory.createArrowFunction(
        undefined,
        undefined,
        [],
        undefined,
        ts.factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
        itemExpression
      )
    ]);
  }

  if (schema.type === 'tuple') {
    const items = Array.isArray(schema.items) ? schema.items.map(toSchemaObject) : [];

    return ts.factory.createArrayLiteralExpression(
      items.map((item) =>
        buildSchemaExpression({
          fakerRoot,
          propertyName,
          schema: item,
          schemaMap,
          visitedRefs
        })
      ),
      false
    );
  }

  if (schema.type === 'boolean')
    return createCall(createFakerAccess(fakerRoot, 'datatype', 'boolean'));
  if (schema.type === 'integer') return createCall(createFakerAccess(fakerRoot, 'number', 'int'));
  if (schema.type === 'number') return createCall(createFakerAccess(fakerRoot, 'number', 'float'));
  if (schema.type === 'null') return ts.factory.createNull();
  if (schema.type === 'string') {
    return buildStringExpression({
      fakerRoot,
      propertyName,
      schema
    });
  }

  return buildUnknownExpression(fakerRoot);
};

export const isObjectSchema = ({
  schema,
  schemaMap,
  visitedRefs
}: {
  schema: SchemaObject;
  schemaMap: Map<string, SchemaRecord>;
  visitedRefs: Set<string>;
}): boolean => {
  if (schema.type === 'object') return true;

  if (typeof schema.$ref === 'string') {
    const refName = getSchemaNameFromRef(schema.$ref);
    const refSchema = schemaMap.get(refName)?.schema;

    if (!refSchema || visitedRefs.has(refName)) return false;

    visitedRefs.add(refName);
    const result = isObjectSchema({
      schema: refSchema,
      schemaMap,
      visitedRefs
    });
    visitedRefs.delete(refName);
    return result;
  }

  return false;
};
