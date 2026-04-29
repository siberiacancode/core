import ts from 'typescript';

export const getFakerCall = (module: string, method: string, args: ts.Expression[] = []) =>
  ts.factory.createCallExpression(
    ts.factory.createPropertyAccessExpression(
      ts.factory.createPropertyAccessExpression(
        ts.factory.createIdentifier('faker'),
        ts.factory.createIdentifier(module)
      ),
      ts.factory.createIdentifier(method)
    ),
    undefined,
    args
  );
