import ts from 'typescript';

// import type { type } from 'ofetch';
export const getImportOfetchTypes = (typeNames: string | string[]) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        (Array.isArray(typeNames) ? typeNames : [typeNames]).map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      )
    ),
    ts.factory.createStringLiteral('ofetch'),
    undefined
  );
