import ts from 'typescript';

export const getRequestUrl = (path: string, hasParams: boolean): ts.Expression => {
  if (!hasParams) return ts.factory.createStringLiteral(path);

  // eslint-disable-next-line no-template-curly-in-string
  const pathWithParams = path.replace(/\{(\w+)\}/g, '${path.$1}');

  return ts.factory.createNoSubstitutionTemplateLiteral(pathWithParams, pathWithParams);
};
