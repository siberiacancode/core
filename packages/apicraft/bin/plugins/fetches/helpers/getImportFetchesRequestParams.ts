import ts from 'typescript';

// import type { FetchesRequestParams } from '@siberiacancode/apicraft';
export const getImportFetchesRequestParams = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('FetchesRequestParams')
        )
      ])
    ),
    ts.factory.createStringLiteral('@siberiacancode/apicraft')
  );
