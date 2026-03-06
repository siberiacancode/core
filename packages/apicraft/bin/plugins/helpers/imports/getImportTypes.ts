import ts from 'typescript';

import { getRelativePath } from '../getRelativePath';

interface GetImportTypesParams {
  folderPath: string;
  generateOutput: string;
  typeNames: string[];
}

// import type { Type } from 'generated/types.gen';
export const getImportTypes = ({ typeNames, folderPath, generateOutput }: GetImportTypesParams) =>
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
    ts.factory.createStringLiteral(getRelativePath(folderPath, `${generateOutput}/types.gen`)),
    undefined
  );
