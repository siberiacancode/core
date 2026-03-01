import * as nodePath from 'node:path';
import ts from 'typescript';

const TYPES_GEN = 'types.gen';

// import type { Type } from '<relativePath>/types.gen';
export const getImportTypesFromTypesGen = (
  typeNames: string[],
  folderPath: string,
  generateOutput: string
) =>
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
    ts.factory.createStringLiteral(
      nodePath.relative(folderPath, nodePath.normalize(`${generateOutput}/${TYPES_GEN}`))
    ),
    undefined
  );
