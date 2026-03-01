import * as nodePath from 'node:path';
import ts from 'typescript';

// import type { Type } from './<relativePath>/types.gen';
export const getTypes = (typeNames: string[], folderPath: string, generateOutput: string) =>
  ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      true,
      undefined,
      ts.factory.createNamedImports(
        typeNames.map((name) =>
          ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(name))
        )
      )
    ),
    ts.factory.createStringLiteral(nodePath.relative(folderPath, `./${generateOutput}/types.gen`)),
    undefined
  );
