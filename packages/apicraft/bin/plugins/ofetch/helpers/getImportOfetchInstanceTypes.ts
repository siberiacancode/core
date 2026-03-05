import ts from 'typescript';

// import type { $Fetch, FetchOptions, FetchRequest, MappedResponseType, ResponseType } from 'ofetch';
export const getImportOfetchInstanceTypes = () =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier('$Fetch')),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('FetchOptions')
        ),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('FetchRequest')
        ),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('MappedResponseType')
        ),
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier('ResponseType')
        )
      ])
    ),
    ts.factory.createStringLiteral('ofetch'),
    undefined
  );
