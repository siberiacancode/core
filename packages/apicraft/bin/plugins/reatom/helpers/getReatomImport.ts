import ts from 'typescript';

export const getReatomCoreImport = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('action')),
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('computed')),
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('wrap')),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('withAsync')
        ),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('withAsyncData')
        )
      ])
    ),
    ts.factory.createStringLiteral('@reatom/core')
  );

export const getReatomSettingsTypeImport = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('ReatomAsyncDataSettings')
        ),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('ReatomAsyncSettings')
        )
      ])
    ),
    ts.factory.createStringLiteral('@siberiacancode/apicraft')
  );
