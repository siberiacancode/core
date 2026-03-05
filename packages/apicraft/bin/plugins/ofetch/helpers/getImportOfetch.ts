import ts from 'typescript';

// import ofetch from 'ofetch';
export const getImportOfetch = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('ofetch'), undefined),
    ts.factory.createStringLiteral('ofetch')
  );
