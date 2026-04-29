import ts from 'typescript';

// import { name } from '@siberiacancode/apicraft';
export const getApicraftImport = (name: string) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
      ])
    ),
    ts.factory.createStringLiteral('@siberiacancode/apicraft')
  );
