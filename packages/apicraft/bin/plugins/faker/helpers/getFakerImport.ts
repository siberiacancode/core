import ts from 'typescript';

// import { faker } from '@faker-js/faker';
export const getFakerImport = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('faker'))
      ])
    ),
    ts.factory.createStringLiteral('@faker-js/faker')
  );
