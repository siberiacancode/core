import ts from 'typescript';

// import { name } from '@reatom/core';
export const getReatomImport = (name: string | string[]) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports(
        (Array.isArray(name) ? name : [name]).map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      )
    ),
    ts.factory.createStringLiteral('@reatom/core')
  );
