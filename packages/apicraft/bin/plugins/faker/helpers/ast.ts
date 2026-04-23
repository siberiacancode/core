import ts from 'typescript';

const IDENTIFIER_REGEXP = /^[$A-Z_][\w$]*$/i;

export const identifier = (value: string) => ts.factory.createIdentifier(value);
export const stringLiteral = (value: string) => ts.factory.createStringLiteral(value);

export const createPropertyAccess = (expression: ts.Expression, name: string) =>
  ts.factory.createPropertyAccessExpression(expression, identifier(name));

export const createCall = (
  expression: ts.Expression,
  args: ts.Expression[] = [],
  typeArgs?: ts.TypeNode[]
) => ts.factory.createCallExpression(expression, typeArgs, args);

export const createFakerAccess = (fakerRoot: ts.Expression, ...segments: string[]) =>
  segments.reduce((expression, segment) => createPropertyAccess(expression, segment), fakerRoot);

export const toPropertyName = (value: string): ts.PropertyName =>
  IDENTIFIER_REGEXP.test(value) ? identifier(value) : stringLiteral(value);

export const toExpression = (value: unknown): ts.Expression => {
  if (value === undefined) return identifier('undefined');
  if (value === null) return ts.factory.createNull();
  if (typeof value === 'string') return stringLiteral(value);
  if (typeof value === 'number') return ts.factory.createNumericLiteral(value);
  if (typeof value === 'boolean') return value ? ts.factory.createTrue() : ts.factory.createFalse();

  if (Array.isArray(value)) {
    return ts.factory.createArrayLiteralExpression(
      value.map((item) => toExpression(item)),
      false
    );
  }

  if (typeof value === 'object' && value !== null) {
    return ts.factory.createObjectLiteralExpression(
      Object.entries(value).map(([key, nestedValue]) =>
        ts.factory.createPropertyAssignment(toPropertyName(key), toExpression(nestedValue))
      ),
      true
    );
  }

  return identifier('undefined');
};

export const createArrayElementCall = (fakerRoot: ts.Expression, expressions: ts.Expression[]) =>
  createCall(createFakerAccess(fakerRoot, 'helpers', 'arrayElement'), [
    ts.factory.createArrayLiteralExpression(expressions, false)
  ]);
