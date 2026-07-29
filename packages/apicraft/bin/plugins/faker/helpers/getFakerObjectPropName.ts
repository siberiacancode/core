import ts from 'typescript';

export const getFakerObjectPropName = (propName: string) =>
  /^[a-z_$][\w$]*$/i.test(propName)
    ? ts.factory.createIdentifier(propName)
    : ts.factory.createStringLiteral(propName);
