import ts from 'typescript';

// import { ofetch } from 'ofetch';
export const getImportOfetch = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('ofetch'))
      ])
    ),
    ts.factory.createStringLiteral('ofetch')
  );
