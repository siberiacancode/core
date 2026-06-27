import ts from 'typescript';

// import type { name } from '@tanstack/react-query';
export const getTanstackTypeImport = (name: string | string[]) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ...(Array.isArray(name) ? name : [name]).map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      ])
    ),
    ts.factory.createStringLiteral('@tanstack/react-query')
  );
