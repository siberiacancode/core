import * as nodePath from 'node:path';
import ts from 'typescript';

interface GetImportTypesParams {
  folderPath: string;
  generateOutput: string;
  instanceVariant: 'class' | 'function';
  typeNames: string[];
}

// import type { Type } from 'generated/types.gen';
export const getImportTypes = ({
  typeNames,
  folderPath,
  generateOutput,
  instanceVariant
}: GetImportTypesParams) => {
  return ts.factory.createImportDeclaration(
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
    ts.factory.createStringLiteral(
      instanceVariant === 'function'
        ? nodePath.relative(folderPath, `${generateOutput}/types.gen`)
        : './types.gen'
    ),
    undefined
  );
};
