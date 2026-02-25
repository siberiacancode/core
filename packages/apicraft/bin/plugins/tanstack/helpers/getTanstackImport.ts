import ts from 'typescript';

// import { name } from '@tanstack/react-query';
export const getTanstackImport = (name: string | string[]) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ...(Array.isArray(name) ? name : [name]).map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      ])
    ),
    ts.factory.createStringLiteral('@tanstack/react-query')
  );
