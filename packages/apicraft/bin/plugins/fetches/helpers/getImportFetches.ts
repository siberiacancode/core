import ts from 'typescript';

// import fetches from '@siberiacancode/fetches';
export const getImportFetches = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(false, ts.factory.createIdentifier('fetches'), undefined),
    ts.factory.createStringLiteral('@siberiacancode/fetches')
  );
