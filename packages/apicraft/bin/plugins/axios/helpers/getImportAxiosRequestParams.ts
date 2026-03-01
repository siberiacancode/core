import ts from 'typescript';

// import type { AxiosRequestParams } from '@siberiacancode/apicraft';
export const getImportAxiosRequestParams = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('AxiosRequestParams')
        )
      ])
    ),
    ts.factory.createStringLiteral('@siberiacancode/apicraft')
  );
