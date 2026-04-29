import type { IR } from '@hey-api/openapi-ts';

import ts from 'typescript';

import { capitalize } from '@/bin/plugins/helpers';

import { getFakerCall } from './getFakerCall';

const matchName = (name: string, ...keywords: string[]) =>
  keywords.some((keyword) => name.toLowerCase().includes(keyword.toLowerCase()));

const getFakerValueByName = (name: string): ts.Expression => {
  if (matchName(name, 'email')) return getFakerCall('internet', 'email');
  if (matchName(name, 'username', 'user_name')) return getFakerCall('internet', 'username');
  if (matchName(name, 'password')) return getFakerCall('internet', 'password');
  if (matchName(name, 'url', 'website', 'href', 'link')) return getFakerCall('internet', 'url');
  if (matchName(name, 'avatar', 'photo', 'image', 'picture', 'thumbnail'))
    return getFakerCall('image', 'url');
  if (matchName(name, 'firstname', 'first_name')) return getFakerCall('person', 'firstName');
  if (matchName(name, 'lastname', 'last_name')) return getFakerCall('person', 'lastName');
  if (matchName(name, 'fullname', 'full_name', 'displayname', 'display_name'))
    return getFakerCall('person', 'fullName');
  if (name.toLowerCase() === 'name') return getFakerCall('person', 'fullName');
  if (matchName(name, 'phone', 'tel', 'mobile', 'fax')) return getFakerCall('phone', 'number');
  if (matchName(name, 'company', 'organization', 'employer', 'firm'))
    return getFakerCall('company', 'name');
  if (matchName(name, 'address', 'street')) return getFakerCall('location', 'streetAddress');
  if (name.toLowerCase() === 'city' || matchName(name, 'cityname'))
    return getFakerCall('location', 'city');
  if (matchName(name, 'country')) return getFakerCall('location', 'country');
  if (matchName(name, 'zip', 'postal', 'postcode')) return getFakerCall('location', 'zipCode');
  if (matchName(name, 'latitude', '_lat')) return getFakerCall('location', 'latitude');
  if (matchName(name, 'longitude', '_lon', '_lng')) return getFakerCall('location', 'longitude');
  if (matchName(name, 'color', 'colour')) return getFakerCall('color', 'human');
  if (matchName(name, 'description', 'bio', 'summary', 'content', 'body', 'text', 'message'))
    return getFakerCall('lorem', 'sentence');
  if (matchName(name, 'title', 'subject', 'heading', 'label'))
    return getFakerCall('lorem', 'words');
  if (matchName(name, 'slug')) return getFakerCall('lorem', 'slug');
  if (matchName(name, 'token', 'secret', 'apikey', 'api_key', 'accesskey', 'access_key'))
    return getFakerCall('string', 'alphanumeric', [ts.factory.createNumericLiteral('32')]);
  if (
    name.toLowerCase() === 'id' ||
    name.toLowerCase().endsWith('id') ||
    matchName(name, 'uuid', 'guid')
  )
    return getFakerCall('string', 'uuid');
  if (matchName(name, 'createdat', 'updatedat', 'deletedat', 'date', 'time', '_at'))
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        getFakerCall('date', 'recent'),
        ts.factory.createIdentifier('toISOString')
      ),
      undefined,
      []
    );
  if (matchName(name, 'price', 'amount', 'cost', 'salary', 'fee'))
    return getFakerCall('number', 'float');
  if (matchName(name, 'count', 'total', 'quantity', 'size', 'length', 'age', 'year', 'limit'))
    return getFakerCall('number', 'int');

  return getFakerCall('lorem', 'word');
};

const getFakerValueBySchema = (
  propName: string,
  schema: IR.SchemaObject
): ts.Expression | undefined => {
  if (schema.$ref) {
    const refName = schema.$ref.split('/').pop()!;
    return ts.factory.createCallExpression(
      ts.factory.createIdentifier(`create${capitalize(refName)}`),
      undefined,
      []
    );
  }

  if (schema.type === 'array') {
    if (schema.items?.length) {
      return ts.factory.createArrayLiteralExpression(
        [getFakerValue(propName, schema.items[0])],
        false
      );
    }
    return ts.factory.createArrayLiteralExpression([], false);
  }

  if (schema.type === 'object') {
    if (schema.properties) {
      return ts.factory.createObjectLiteralExpression(
        Object.entries(schema.properties).map(([nestedPropName, nestedPropSchema]) =>
          ts.factory.createPropertyAssignment(
            ts.factory.createIdentifier(nestedPropName),
            getFakerValue(nestedPropName, nestedPropSchema)
          )
        ),
        true
      );
    }
    return ts.factory.createObjectLiteralExpression([], false);
  }

  if (schema.type === 'enum' && schema.items?.length) {
    const first = schema.items[0];
    if (first.const) {
      const value = first.const;
      if (typeof value === 'string') return ts.factory.createStringLiteral(value);
      if (typeof value === 'number') return ts.factory.createNumericLiteral(String(value));
      if (typeof value === 'boolean')
        return value ? ts.factory.createTrue() : ts.factory.createFalse();
    }
  }

  if (schema.format === 'date-time' || schema.format === 'date') {
    return ts.factory.createCallExpression(
      ts.factory.createPropertyAccessExpression(
        getFakerCall('date', 'recent'),
        ts.factory.createIdentifier('toISOString')
      ),
      undefined,
      []
    );
  }

  if (schema.format === 'email') return getFakerCall('internet', 'email');
  if (schema.format === 'uri' || schema.format === 'url') return getFakerCall('internet', 'url');
  if (schema.format === 'uuid') return getFakerCall('string', 'uuid');
  if (schema.format === 'password') return getFakerCall('internet', 'password');
  if (schema.type === 'boolean') return getFakerCall('datatype', 'boolean');
  if (schema.type === 'integer') return getFakerCall('number', 'int');
  if (schema.type === 'number') return getFakerCall('number', 'float');

  return undefined;
};

export const getFakerValue = (propName: string, schema: IR.SchemaObject) =>
  getFakerValueBySchema(propName, schema) ?? getFakerValueByName(propName);
